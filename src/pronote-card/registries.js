// ── Registries ──
// Every device with Pronote entities is a student. Resolved once per registry objects (HA replaces them when they change).
import { PLATFORM, periodOf, roleOf } from "./core.js";

export const _cache = new WeakMap();
export const resolve = (hass) => {
  const ents = hass?.entities || {};
  const hit = _cache.get(ents);
  if (hit && hit.devices === hass.devices) return hit.students;
  const byDevice = new Map();
  // A Pronote entity without a role and without its state yet (Home Assistant still loading): its role may come from
  // the state's attributes (1.x class sensor), so the result is not cached until every state is there.
  let pending = false;
  for (const e of Object.values(ents)) {
    if (e.platform !== PLATFORM || !e.device_id) continue;
    const state = hass.states?.[e.entity_id];
    // Integration 1.x: the student's own sensor (`sensor.pronote_<student>`) carries the class and the school.
    const role = roleOf(e) ?? (state?.attributes?.class_name !== undefined ? "class" : undefined);
    const period = role ? undefined : periodOf(e, state);
    if (!role && !period) {
      if (!state) pending = true;
      continue;
    }
    let s = byDevice.get(e.device_id);
    if (!s) {
      const d = hass.devices?.[e.device_id] || {};
      s = { id: e.device_id, deviceName: d.name_by_user || d.name || "", entities: {}, periods: {} };
      byDevice.set(e.device_id, s);
    }
    if (role) s.entities[role] ??= e.entity_id;
    else (s.periods[period.key] ??= {})[period.role] ??= e.entity_id;
  }
  const students = [...byDevice.values()].sort((a, b) => a.deviceName.localeCompare(b.deviceName));
  if (!pending) _cache.set(ents, { devices: hass.devices, students });
  return students;
};

// The student's name: the nickname set in the integration, else the full name, else the device name without its
// "Pronote - " prefix.
export const studentName = (hass, s) => {
  const d = hass.devices?.[s.id];
  if (d?.name_by_user) return d.name_by_user;
  for (const id of Object.values(s.entities)) {
    const a = hass.states[id]?.attributes;
    if (a?.nickname) return a.nickname;
    if (a?.full_name) return a.full_name;
  }
  return s.deviceName.replace(/^Pronote\s*-\s*/i, "") || s.id;
};

export const matches = (hass, s, ref) => {
  const r = String(ref).toLowerCase();
  return s.id === ref || s.deviceName.toLowerCase() === r || studentName(hass, s).toLowerCase() === r;
};

// The students a card shows: `device` (one) or `devices` (a list, in its order), else all of them.
export const findStudents = (hass, config) => {
  const all = resolve(hass);
  if (!all.length) return { error: "no_student" };
  const refs = config.devices ? [].concat(config.devices) : config.device ? [config.device] : [];
  if (!refs.length) return { students: all };
  const students = [];
  for (const ref of refs) {
    const s = all.find((x) => matches(hass, x, ref));
    if (!s) return { error: "unknown_device", ref };
    if (!students.includes(s)) students.push(s);
  }
  return { students };
};

export const listStudents = (hass) => resolve(hass).map((s) => ({ value: s.id, label: studentName(hass, s) }));
