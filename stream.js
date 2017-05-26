module.exports = () => {
	'ngInject'

	function Observer(nextHandler, errorHandler, completeHandler) {
		this.closed = false
		this.nextHandler = nextHandler || noop
		this.errorHandler = errorHandler || noop
		this.completeHandler = completeHandler || noop
	}

	Observer.prototype.next = function (value) {
		if (this.closed) return
		this.nextHandler(value)
	}

	Observer.prototype.error = function (error) {
		if (this.closed) return
		this.closed = true
		this.errorHandler(error)
	}

	Observer.prototype.complete = function () {
		if (this.closed) return
		this.closed = true
		this.completeHandler()
	}

	Observer.prototype.unsubscribe = function () {
		if (this.closed) return
		this.closed = true
	}

	function Stream(callback) {
		this.observers = []
		this.callback = callback || noop
	}

	Stream.prototype.map = function (mapFn) {
		return new Stream(observer => {
			this.subscribe(value => observer.next(mapFn(value)))
		})
	}

	Stream.prototype.filter = function (filterFn) {
		return new Stream(observer => {
			this.subscribe(value => {
				if (!filterFn(value)) return
				observer.next(value)
			})
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
		return new Stream(observer => {
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
	}

	Stream.prototype.takeLast = function (count) {
		return new Stream(observer => {
			var queue = []
			this.subscribe(value => {
				queue.push(value)
				queue.slice(-count).map(v => observer.next(v))
				observer.complete()
				observer.closed = false
			})
		})
	}

	Stream.prototype.merge = function () {
		var streams = [].slice.call(arguments)
		streams.unshift(this)
		return new Stream(observer => {
			streams.map(stream => {
				stream.subscribe(value => observer.next(value))
			})
		})
	}

	Stream.prototype.mergeMap = function (mapFn) {
	
	}

	Stream.prototype.takeUntil = function (stream) {
		
	}

	Stream.prototype.next = function (value) {
		this.observers.map(observer => observer.next(value))
	}

	Stream.prototype.error = function (error) {
		this.observers.map(observer => observer.error(error))
	}

	Stream.prototype.complete = function () {
		this.observers.map(observer => observer.complete())
	}

	Stream.prototype.subscribe = function (nextHandler, errorHandler, completeHandler) {
		var observer = new Observer(nextHandler, errorHandler, completeHandler)
		this.observers.push(observer)
		this.callback(observer)
		return observer
	}

	Stream.fromEvent = function (target, event) {
		return new Stream(observer => {
			target.addEventListener(event, e => observer.next(e))
		})
	}

	function noop() {
		return undefined
	}

	return Stream
}