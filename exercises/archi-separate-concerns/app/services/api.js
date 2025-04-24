const api = {
  post: async (url, body = {}) => {
    try {
      const res = await fetch(`/api${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { data, ok: res.ok };
    } catch (e) {
      return { data: { message: "Network error" }, ok: false };
    }
  },
};

export default api;
