// Next.js API route for Server-Sent Events payment status stream
// This is a mock/test implementation - integrate with your actual payment verification logic

export default function handler(req, res) {
    const { session_id } = req.query;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ status: 'pending', message: 'Connected, waiting for payment confirmation...' })}\n\n`);

    // For testing: simulate payment confirmation after 3 seconds
    // In production, replace this with actual payment status checking logic
    const checkInterval = setInterval(async () => {
        try {
            // TODO: Replace with actual payment status check from your database/payment gateway
            // Example: const paymentStatus = await checkPaymentStatus(session_id);

            // For testing with session_id containing 'ORD123' - auto confirm after delay
            // Remove this mock logic in production
            if (session_id && session_id.includes('ORD123')) {
                res.write(`data: ${JSON.stringify({
                    status: 'confirmed',
                    message: 'Payment confirmed!',
                    bookingId: session_id
                })}\n\n`);
                clearInterval(checkInterval);
                res.end();
                return;
            }

            // Default: keep pending
            res.write(`data: ${JSON.stringify({ status: 'pending', message: 'Still processing...' })}\n\n`);

        } catch (error) {
            console.error('SSE error:', error);
            res.write(`data: ${JSON.stringify({ status: 'failed', message: 'Error checking payment status' })}\n\n`);
            clearInterval(checkInterval);
            res.end();
        }
    }, 3000); // Check every 3 seconds

    // Handle client disconnect
    req.on('close', () => {
        clearInterval(checkInterval);
        res.end();
    });
}

// Disable body parsing for SSE
export const config = {
    api: {
        bodyParser: false,
    },
};
