export const fetchAux = async (vars: {
  url: string;
  method: 'POST' | 'GET';
  body?: object;
  headers: { [key: string]: string };
}) => {
  try {
    const data = await fetch(vars.url, {
      method: vars.method,
      body: vars.body ? JSON.stringify(vars.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...vars.headers,
      },
    });

    if (!data.ok) {
      throw new Error(`HTTP error: ${data.status}`);
    }

    return await data.json();
  } catch (e) {
    throw new Error(e);
  }
};
