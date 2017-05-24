module.exports = Queue => {
	'ngInject'

	function Stream(callback) {
		this.observers = []
		this.callback = callback
	}

	Stream.prototype.map = function (mapFn) {
		return new Stream(observer => {
			this.subscribe(value => observer.next(mapFn(value)))
		})
	}

	Stream.prototype.distinctUntilChanged = function () {
		return new Stream(observer => {
			this.takeLast(2)
				.toArray()
				.subscribe(value => {
					if (value.length == 1) return observer.next(value[0])
					if (value[0] == value[1]) return
					observer.next(value[1])
				})
		})
	}

	Stream.prototype.toArray = function () {
		var stream = new Stream(observer => {
			var array = []
			this.subscribe(
				v => array.push(v),
				e => {},
				() => {
					observer.next(array)
					array = []
				}
			)
		})
		return stream
	}

	Stream.prototype.takeLast = function (count) {
		var stream = new Stream(observer => {
			var queue = []
			this.subscribe(value => {
				queue.push(value)
				queue.slice(-count).map(v => observer.next(v))
				observer.complete()
			})
		})
		return stream
	}

	Stream.prototype.subscribe = function (nextHandler, errorHandler, completeHandler) {
		var observer = { next: nextHandler, error: errorHandler, complete: completeHandler }
		this.observers.push(observer)
		this.callback && this.callback(observer)
	}

	Stream.prototype.onError = function (error) {
		this.observers.map(observer => observer.error(error))
	}

	return Stream
}