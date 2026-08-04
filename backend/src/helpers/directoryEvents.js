const clients = new Set();

export function subscribeToDirectoryEvents(response) {
  clients.add(response);
  response.write("retry: 5000\n\n");
  return () => clients.delete(response);
}

export function publishDirectoryUpdate(change) {
  const message = `event: directory-updated\ndata: ${JSON.stringify({ change, at: new Date().toISOString() })}\n\n`;
  for (const client of clients) client.write(message);
}
