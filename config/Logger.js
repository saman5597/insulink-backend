const axios = require('axios')

module.exports = class Logger {
    constructor(appName, date) {
        this.appName = appName
        this.date = date || new Date().toISOString()
    }

    // debug messages
    async d(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=debug&appName=${this.appName}&date=${this.date}&msg=${msg}`, { payload })
    }

    // info messages
    async i(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=info&appName=${this.appName}&date=${this.date}&msg=${msg}`, { payload })
    }

    // warning messages
    async w(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=warning&appName=${this.appName}&date=${this.date}&msg=${msg}`, { payload })
    }

    // error messages
    async e(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=error&appName=${this.appName}&date=${this.date}&msg=${msg}`, { payload })
    }

}