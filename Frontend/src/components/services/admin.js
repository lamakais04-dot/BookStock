import axios from "axios";
const BASE_URL = "http://localhost:8000";

export default class AdminService {
  static async getUsers(q = "") {
    const res = await axios.get(`${BASE_URL}/admin/users`, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" },
      params: q ? { q } : undefined
    });
    return res.data;
  }

  static async getUserBorrows(userId, onlyOpen = false) {
    const res = await axios.get(`${BASE_URL}/admin/users/${userId}/borrows`, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" },
      params: onlyOpen ? { only_open: true } : undefined
    });
    return res.data;
  }

  static async getActivity(params = {}) {
    const res = await axios.get(`${BASE_URL}/admin/activity`, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" },
      params
    });
    return res.data;
  }

  static async exportActivityExcel(params = {}) {
    const res = await axios.get(`${BASE_URL}/admin/export/activity.xlsx`, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" },
      params,
      responseType: "blob"
    });
    return res.data;
  }

  static async exportActivityPdf(params = {}) {
    const res = await axios.get(`${BASE_URL}/admin/export/activity.pdf`, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" },
      params,
      responseType: "blob"
    });
    return res.data;
  }
}
