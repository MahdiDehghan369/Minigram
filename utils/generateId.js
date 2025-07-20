module.exports = () => {
    try {
        return Math.floor(100000 + Math.random() * 900000).toString();
    } catch (error) {
        next(error)
    }
}