module.exports = ($timeout) => {
	'ngInject'

	function isArray(arr) {
		if (Array.isArray) {
			return Array.isArray(arr)
		}
		return Object.prototype.toString.call(arr) == '[object Array]'
	}

	function unique(arr) {
		if (! isArray(arr)) {
			return []
		}
		return arr.filter(function (item, key) { return arr.indexOf(item) == key })
	}

	function dateNumToStr(year, month, day) {
		return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2)
	}

	function dateStrToNum(str) {
		return str.split('-').map(function (item) { return parseInt(trimStart(item, 0)) })
	}

	function trim(str, needle) {
		str = trimStart(str, needle)
		str = trimEnd(str, needle)
		return str
	}

	function trimStart(str, needle) {
		return str.replace(new RegExp('^(' + needle + ')+'), '')
	}

	function trimEnd(str, needle) {
		return str.replace(new RegExp('(' + needle + ')+$'), '')
	}

	function toPath(str) {
		return str.split('.')
	}

	function get(obj, str, defaultValue) {
		try {
			var value = toPath(str).reduce(function (o, p) { return o[p] }, obj)
			return value === undefined ? defaultValue : value
		} catch (e) {
			return defaultValue
		}
	}

	function invoke(obj, path/* args */) {
		var fn = get(obj, path)
		if (isUndefined(fn)) return undefined
		if (!isFunction(fn)) throw new Error('invoke path error')
		// XXX obj
		fn.apply(obj, [].slice.call(arguments, 2))
	}

	function isUndefined(obj) {
		return obj === undefined
	}

	function isFunction(fn) {
		return typeof fn == 'function'
	}

	function isNull(obj) {
		return obj === null
	}

	function isNumber(value) {
		return typeof value == 'number'
	}

	function toNumber(value) {
		return Number(value)
	}

	function validator(fn, err) {
		return (value, on) => {
			if (isUndefined(on)) on = true
			if (!on) return [true, '']
			return fn(value) ? [true, ''] : [false, err]
		}
	}

	function validators() {
		var funcs = [].slice.call(arguments)
		return (value, on) => {
			if (isUndefined(on)) on = true
			if (!on) return [true, '']
			return funcs.reduce((r, f) => r[0] ? f(value) : r, [true, ''])
		}
	}

	function validate() {
		var validators = [].slice.call(arguments)
		return validators.reduce((r, i) => r[0] ? i : r, [true, ''])
	}

	function set(o, k, v) {
		// XXX
		o[k] = v
		return o
	}

	// XXX
	function memoize(fn, hasher) {
		var cache = {}
		if (!isFunction(hasher)) {
			hasher = function () {
				var args = [].slice.call(arguments)
				return args.length ? args[0].toString() : ''
			}
		}

		var closure = function (/* args */) {
			var args = [].slice.call(arguments)
			var key = hasher.apply(null, args)
			if (cache.hasOwnProperty(key)) return cache[key]
			cache[key] = fn(args)
			return cache[key]
		}

		closure.clear = () => {
			cache = {}
		}

		return closure
	}

	// XXX
	function once(fn) {
		var isCalled = false
		var result = null
		return function (/* args */) {
			if (isCalled) return result
			var args = [].slice.call(arguments)
			result = fn(args)
			return result
		}
	}

	// XXX
	function debounce(fn, wait) {
		var t = null
		return function (/* args */) {
			var args = [].slice.call(arguments)
			$timeout.cancel(t)
			t = $timeout(() => {
				fn.apply(null, args)
				t = null
			}, wait)
		}
	}

	function inherit(subClass, superClass) {
		subClass.prototype = Object.create(superClass.prototype)
		subClass.prototype.constructor = subClass
		subClass.superClass = superClass
	}

	function range(start, end) {
		return Array(end - start).fill().map((v, k) => start + k)
	}

	function pickBy(obj, fn) {
		return Object.keys(obj).reduce((o, k) => fn(obj[k], k, obj) ? set(o, k, obj[k]) : o, {})
	}

	function pick(obj, fields) {
		return pickBy(obj, (v, k) => fields.indexOf(k) != -1)
	}

	function isPlainObject(obj) {
		return Object.prototype.toString.call(obj) == '[object Object]'
	}

	function map(obj, cb) {
		var arr = []
		for (var pro in obj) {
			if (obj.hasOwnProperty(pro)) {
				arr.push(cb(obj[pro], pro, obj))
			}
		}
		return arr
	}

	function size(obj) {
		if (isArray(obj)) return obj.length
		if (isPlainObject(obj)) return Object.keys(obj).length
		return 0
	}

	function isString(obj) {
		return typeof obj == 'string'
	}

	function isEmpty(obj) {
		if (isUndefined(obj)) return true
		if (isNull(obj)) return true
		if (isNumber(obj) && !obj) return true
		if (isString(obj) && !obj) return true
		if (isArray(obj) && !size(obj)) return true
		if (isPlainObject(obj) && !size(obj)) return true
		return false
	}

	function isPromise(obj) {
		return !isUndefined(Object(obj).then)
	}

	function flow(/* funcs */) {
		var funcs = [].slice.call(arguments)
		return function () {
			if (!size(funcs)) return undefined
			var args = [].slice.call(arguments)
			var result = funcs[0].apply(null, args)
			return funcs.slice(1).reduce((a, f) => f(a), result)
		}
	}

	// FIXME
	function isEqual(a, b) {
		if (isArray(a) && isArray(b)) {
			return size(a) == size(b) && a.every((v, k) => v == b[k])
		}

		return false
	}

	function defaultTo(value, defaultValue) {
		if (isNaN(value)) return defaultValue
		if (isNull(value)) return defaultValue
		if (isUndefined(value)) return defaultValue
		return value
	}

	function compact(array) {
		return array.filter(item => !isEmpty(item))
	}

	function last(array) {
		return array[array.length - 1]
	}

	return {
		isArray: isArray,
		unique: unique,
		dateNumToStr: dateNumToStr,
		trim: trim,
		dateStrToNum: dateStrToNum,
		trimStart: trimStart,
		trimEnd: trimEnd,
		get: get,
		invoke: invoke,
		isUndefined: isUndefined,
		isFunction: isFunction,
		isNumber: isNumber,
		validator: validator,
		validators: validators,
		debounce: debounce,
		validate: validate,
		inherit: inherit,
		range: range,
		set: set,
		pick: pick,
		pickBy: pickBy,
		isPlainObject: isPlainObject,
		isNull: isNull,
		map: map,
		isEmpty: isEmpty,
		size: size,
		once: once,
		flow: flow,
		isEqual: isEqual,
		defaultTo: defaultTo,
		toNumber: toNumber,
		isPromise: isPromise,
		compact: compact,
		last: last
	}
}