export function broadcastToClients(message: any) {
  const wss = (global as any).wss;
  if (!wss) return;

  const messageString = JSON.stringify(message);
  
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(messageString);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        // Remove the client if it's causing issues
        try {
          client.terminate();
        } catch (terminateError) {
          console.error('Error terminating WebSocket client:', terminateError);
        }
      }
    }
  });
}