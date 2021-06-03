const axios = require('axios')

module.exports = class Logger {
    constructor(appName, version, ip, host, date) {
        this.appName = appName
        this.version = version
        this.ip = ip
        this.host = host
        this.date = date || new Date().toISOString()
    }

    // debug messages
    async d(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=debug&appName=${this.appName}&date=${this.date}&version=${this.version}&msg=${msg}`, { payload, host: this.host, ip: this.ip })
    }

    // info messages
    async i(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=info&appName=${this.appName}&date=${this.date}&version=${this.version}&msg=${msg}`, { payload, host: this.host, ip: this.ip })
    }

    // warning messages
    async w(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=warning&appName=${this.appName}&date=${this.date}&version=${this.version}&msg=${msg}`, { payload, host: this.host, ip: this.ip })
    }

    // error messages
    async e(msg, payload) {
        payload = payload || {}
        await axios.post(`${process.env.LOGGER_URL}?logtype=error&appName=${this.appName}&date=${this.date}&version=${this.version}&msg=${msg}`, { payload, host: this.host, ip: this.ip })
    }

}