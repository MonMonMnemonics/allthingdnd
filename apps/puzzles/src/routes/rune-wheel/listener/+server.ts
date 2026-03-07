export function GET() {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const body = new ReadableStream({
    start(controller) {
      const intervalId = setInterval(() => {
        const data = `data: The current time is ${new Date().toLocaleTimeString()}\n\n`;
        controller.enqueue(data);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    },
  });

  return new Response(body, { headers });
}