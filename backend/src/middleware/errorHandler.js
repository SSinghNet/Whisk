export default (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[${req.method}] ${req.path} — ${status}: ${message}`);

    res.status(status).json({
        success: false,
        message,
    });
};