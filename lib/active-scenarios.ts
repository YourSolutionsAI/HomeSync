import { supabase } from './supabase';
import { UserActiveScenario } from './types';

/**
 * Lädt alle aktiven Szenarien für einen Benutzer
 */
export async function getUserActiveScenarios(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_active_scenarios')
      .select('scenario_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der aktiven Szenarien:', error);
      return [];
    }

    return (data || []).map((item: { scenario_id: string }) => item.scenario_id);
  } catch (error) {
    console.error('Fehler beim Laden der aktiven Szenarien:', error);
    return [];
  }
}

/**
 * Fügt ein Szenario zu den aktiven Szenarien hinzu
 */
export async function addActiveScenario(userId: string, scenarioId: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('user_active_scenarios') as any)
      .upsert({
        user_id: userId,
        scenario_id: scenarioId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,scenario_id'
      });

    if (error) {
      console.error('Fehler beim Hinzufügen des aktiven Szenarios:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Hinzufügen des aktiven Szenarios:', error);
    return false;
  }
}

/**
 * Entfernt ein Szenario aus den aktiven Szenarien
 */
export async function removeActiveScenario(userId: string, scenarioId: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('user_active_scenarios') as any)
      .delete()
      .eq('user_id', userId)
      .eq('scenario_id', scenarioId);

    if (error) {
      console.error('Fehler beim Entfernen des aktiven Szenarios:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Entfernen des aktiven Szenarios:', error);
    return false;
  }
}

/**
 * Prüft, ob ein Szenario für einen Benutzer aktiv ist
 */
export async function isScenarioActive(userId: string, scenarioId: string): Promise<boolean> {
  try {
    const { data, error } = await (supabase
      .from('user_active_scenarios') as any)
      .select('id')
      .eq('user_id', userId)
      .eq('scenario_id', scenarioId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Fehler beim Prüfen des aktiven Szenarios:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Fehler beim Prüfen des aktiven Szenarios:', error);
    return false;
  }
}

/**
 * Entfernt alle aktiven Szenarien für einen Benutzer (z.B. beim Logout)
 */
export async function clearAllActiveScenarios(userId: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('user_active_scenarios') as any)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Fehler beim Löschen aller aktiven Szenarien:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Löschen aller aktiven Szenarien:', error);
    return false;
  }
}

/**
 * Offline-Fallback: Lädt aktive Szenarien aus localStorage
 */
export function getUserActiveScenariosOffline(userId: string): string[] {
  try {
    const saved = localStorage.getItem(`activeScenarios_${userId}`);
    if (saved) {
      const scenarios = JSON.parse(saved);
      return Array.isArray(scenarios) ? scenarios : [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Offline-Fallback: Speichert aktive Szenarien in localStorage
 */
export function saveUserActiveScenariosOffline(userId: string, scenarios: string[]): void {
  try {
    localStorage.setItem(`activeScenarios_${userId}`, JSON.stringify(scenarios));
  } catch (error) {
    console.error('Fehler beim Speichern der aktiven Szenarien offline:', error);
  }
}

/**
 * Synchronisiert aktive Szenarien zwischen Datenbank und localStorage
 */
export async function syncActiveScenarios(userId: string): Promise<string[]> {
  try {
    // Versuche zuerst aus der Datenbank zu laden
    const dbScenarios = await getUserActiveScenarios(userId);
    
    // Speichere auch offline für Fallback
    saveUserActiveScenariosOffline(userId, dbScenarios);
    
    return dbScenarios;
  } catch (error) {
    console.error('Fehler bei der Synchronisation der aktiven Szenarien:', error);
    // Fallback auf localStorage
    return getUserActiveScenariosOffline(userId);
  }
}
