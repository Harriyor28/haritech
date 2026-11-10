import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabase, isCloudConfigured } from '../../../utils/supabaseClient';
import { getStoredProjects, setStoredProjects, type ProjectData } from '../../../utils/projects';
import {
  getStoredTestimonials,
  setStoredTestimonials,
  type Testimonial,
} from '../../../utils/testimonials';
import { getStoredSettings, setStoredSettings, type SiteSettings } from '../../../utils/settings';
import { getStoredBrandLogo, setStoredBrandLogo } from '../../../utils/brand';
import { syncFromCloud } from '../../../utils/cloudSync';

export interface ContactMessageRow {
  id: number;
  form: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  budget: string;
  timeline: string;
  contact_method: string;
  created_at: string;
  category?: string;
  consent_marketing?: boolean;
  source_page?: string;
  status?: string;
  notification_status?: string;
  notification_error?: string;
  notified_at?: string;
}

export interface ApplicationSummary {
  total: number;
  queries: number;
}

const FULL_SELECT =
  '*, status, notification_status, notification_error, notified_at, category, consent_marketing, source_page, user_agent';

export const useAdminData = () => {
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStoredTestimonials());
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [logo, setLogo] = useState<string>(() => getStoredBrandLogo());

  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messagesVersion, setMessagesVersion] = useState(0);

  const [applications, setApplications] = useState<ApplicationSummary | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date>(() => new Date());
  const [syncing, setSyncing] = useState(false);

  const cloudConfigured = isCloudConfigured();

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void sb.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });
    const { data: subscription } = sb.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const refresh = () => {
      setProjects(getStoredProjects());
      setTestimonials(getStoredTestimonials());
      setSettings(getStoredSettings());
      setLogo(getStoredBrandLogo());
    };
    window.addEventListener('haritech-projects-updated', refresh);
    window.addEventListener('haritech-testimonials-updated', refresh);
    window.addEventListener('haritech-settings-updated', refresh);
    window.addEventListener('haritech-logo-updated', refresh);
    return () => {
      window.removeEventListener('haritech-projects-updated', refresh);
      window.removeEventListener('haritech-testimonials-updated', refresh);
      window.removeEventListener('haritech-settings-updated', refresh);
      window.removeEventListener('haritech-logo-updated', refresh);
    };
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setMessagesLoading(false);
      setMessagesError('Cloud sync is not configured — enquiries cannot be loaded.');
      return;
    }

    let cancelled = false;
    setMessagesLoading(true);
    setMessagesError(null);

    const load = async () => {
      // The live table may predate a migration; ask for every column, then fall
      // back to * so an older schema still lists messages instead of blanking.
      let result = await sb
        .from('contact_messages')
        .select(FULL_SELECT)
        .order('created_at', { ascending: false })
        .limit(300);
      let schemaOutdated = false;

      if (
        result.error &&
        (result.error.code === 'PGRST205' || /does not exist|schema cache/i.test(result.error.message))
      ) {
        schemaOutdated = true;
        result = await sb
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(300);
      }

      if (cancelled) return;

      if (result.error) {
        const missing = /does not exist|schema cache/i.test(result.error.message);
        setMessagesError(
          missing
            ? 'Table "contact_messages" is missing — run the contact_messages section of supabase/schema.sql in the Supabase SQL editor.'
            : result.error.message
        );
      } else {
        setMessages((result.data as ContactMessageRow[]) ?? []);
        if (schemaOutdated) {
          setMessagesError(
            'The contact_messages table is missing newer columns (status, notification_status, category, consent_marketing, source_page). Run the upgrade statements from supabase/schema.sql, then refresh. Messages still list with safe defaults.'
          );
        }
      }
      setSyncedAt(new Date());
      setMessagesLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [messagesVersion]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    void sb
      .from('cac_applications')
      .select('stage')
      .limit(500)
      .then(({ data, error }) => {
        if (cancelled || error || !Array.isArray(data)) return;
        const rows = data as Array<{ stage?: string }>;
        setApplications({
          total: rows.length,
          queries: rows.filter((row) => row.stage === 'query').length,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [messagesVersion]);

  const saveProjects = useCallback(async (updated: ProjectData[]): Promise<boolean> => {
    setProjects(updated);
    return setStoredProjects(updated);
  }, []);

  const saveTestimonials = useCallback(async (updated: Testimonial[]): Promise<boolean> => {
    setTestimonials(updated);
    return setStoredTestimonials(updated);
  }, []);

  const saveSettings = useCallback(async (updated: SiteSettings): Promise<boolean> => {
    setSettings(updated);
    return setStoredSettings(updated);
  }, []);

  const saveLogo = useCallback((next: string): boolean => {
    if (!setStoredBrandLogo(next)) return false;
    setLogo(next);
    return true;
  }, []);

  const refreshMessages = useCallback(() => {
    setMessagesVersion((version) => version + 1);
  }, []);

  const updateMessageStatus = useCallback(
    async (ids: number[], status: string): Promise<string | null> => {
      const sb = getSupabase();
      if (!sb || ids.length === 0) return 'Cloud sync is not configured.';
      const { error } = await sb.from('contact_messages').update({ status }).in('id', ids);
      if (error) {
        return /does not exist|column/i.test(error.message)
          ? 'Status update failed: the contact_messages table has no status column. Run the schema.sql upgrade first.'
          : error.message;
      }
      setMessages((current) =>
        current.map((message) => (ids.includes(message.id) ? { ...message, status } : message))
      );
      return null;
    },
    []
  );

  const deleteMessages = useCallback(async (ids: number[]): Promise<string | null> => {
    const sb = getSupabase();
    if (!sb || ids.length === 0) return 'Cloud sync is not configured.';
    const { error } = await sb.from('contact_messages').delete().in('id', ids);
    if (error) {
      return /does not exist|column/i.test(error.message)
        ? 'Delete failed: your contact_messages table is missing columns — run the schema.sql upgrade first.'
        : error.message;
    }
    setMessages((current) => current.filter((message) => !ids.includes(message.id)));
    return null;
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    await syncFromCloud();
    setProjects(getStoredProjects());
    setTestimonials(getStoredTestimonials());
    setSettings(getStoredSettings());
    setMessagesVersion((version) => version + 1);
    setSyncedAt(new Date());
    setSyncing(false);
  }, []);

  const newMessageCount = useMemo(
    () => messages.filter((message) => (message.status ?? 'new') === 'new').length,
    [messages]
  );

  return {
    projects,
    testimonials,
    settings,
    logo,
    messages,
    messagesLoading,
    messagesError,
    applications,
    sessionEmail,
    cloudConfigured,
    newMessageCount,
    syncedAt,
    syncing,
    saveProjects,
    saveTestimonials,
    saveSettings,
    saveLogo,
    refreshMessages,
    updateMessageStatus,
    deleteMessages,
    syncNow,
  };
};
