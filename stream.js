module.exports = (Queue, utils) => {
	function Stream(size) {
		var defaultSize = 10

		this.queue = new Queue(size || defaultSize)
		this.listeners = []
	}

	Stream.prototype.map = function (mapFn) {
		var stream = new Stream()
		this.subscribe(value => stream.onNext(mapFn(value)))
		return stream
	}

	Stream.prototype.distinctUntilChanged = function () {
		var stream = new Stream()
		this.takeLast(2)
			.toArray()
			.subscribe(value => {
				if (value.length == 1) return stream.onNext(value[0])
				if (value[0] == value[1]) return
				stream.onNext(value[1])
			})
		return stream
	}

	Stream.prototype.toArray = function () {
		var stream = new Stream()
		this.subscribe(() => stream.onNext(this.queue.slice()))
		return stream
	}

	Stream.prototype.takeLast = function (count) {
		var stream = new Stream(count)
		this.subscribe(value => this.queue.slice(-count).map(v => stream.onNext(v)))
		return stream
	}

	Stream.prototype.subscribe = function (nextHandler, errorHandler) {
		this.listeners.push([nextHandler, errorHandler])
	}

	Stream.prototype.onNext = function (value) {
		if (utils.isPromise(value)) {
			value.then(thenValue => {
				this.queue.push(thenValue)
				this.listeners.map(listener => listener[0](thenValue))
			})
		} else {
			this.queue.push(value)
			this.listeners.map(listener => listener[0](value))
		}
	}

	Stream.prototype.onError = function (error) {
		this.listeners.map(listener => listener[1](error))
	}

	return Stream
}