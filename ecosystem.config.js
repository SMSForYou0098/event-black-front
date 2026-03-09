module.exports = {
    apps: [
        {
            name: 'getyourticket-new',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            cwd: '/home/getyourticket-t2/htdocs/t2.getyourticket.in', // Update this path
            instances: 2, // Or 'max' for all CPU cores
            exec_mode: 'cluster',
            wait_ready: true,
            listen_timeout: 10000,
            kill_timeout: 5000,
            env: {
                NODE_ENV: 'production',
                PORT: 3000 // Your port
            }
        }
    ]
};