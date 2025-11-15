
import axios from 'axios';
const API = import.meta.env.VITE_API || 'http://localhost:4000';

export async function fetchMentions(q='?limit=300') {
  try {
    const res = await axios.get(`${API}/api/mentions${q}`);
    return res.data || { ok:false };
  } catch (e) {
    console.error('fetchMentions', e.message);
    return { ok:false, error: e.message };
  }
}
