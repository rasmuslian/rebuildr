export const fetchAux = async (vars: {
  url: string;
  method: 'POST' | 'GET';
  body?: object;
  headers: { [key: string]: string };
}) => {
  try {
    console.log('fetch url: ', vars.url);
    const data = await fetch(vars.url, {
      method: vars.method,
      body: vars.body ? JSON.stringify(vars.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...vars.headers,
      },
    });

    const response = await data.json();
    console.log('fetch response: ', response);
    if (!data.ok) {
      throw new Error(`HTTP error: ${data.status}`);
    }
    return response;
  } catch (e) {
    throw new Error(e);
  }
};
