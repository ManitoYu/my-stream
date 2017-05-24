module.exports = ($rootScope, $location, utils, Stream) => {
	'ngInject'

	return new Stream(observer => {
		observer.next($location.hash())
		$rootScope.$on('$locationChangeSuccess', (e, newUrl) => {
			observer.next($location.hash())
		})
	})
}