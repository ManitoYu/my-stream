module.exports = (utils) => {
	'ngInject'

	function Queue(maxSize) {
		this.maxSize = maxSize
		Array.call(this)
	}

	utils.inherit(Queue, Array)

	Queue.prototype.push = function () {
		var args = [].slice.call(arguments)
		Array.prototype.push.apply(this, args)

		if (this.length > this.maxSize) {
			Array(this.length - this.maxSize).fill().map(() => this.shift())
		}

		return this.length
	}

	return Queue
}