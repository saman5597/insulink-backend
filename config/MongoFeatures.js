module.exports = class MongoFeatures {
    constructor(query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }

    filter() {
        const queryObj = { ...this.queryStr }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))

        return this
    }
}