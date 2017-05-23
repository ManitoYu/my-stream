module.exports = ($rootScope, $location, utils, Stream) => {
	function QueryParamsStream() {
		Stream.call(this)
	}

	utils.inherit(QueryParamsStream, Stream)

	QueryParamsStream.shared = new QueryParamsStream()
	$rootScope.$on('$locationChangeSuccess', (e, newUrl) => {
		QueryParamsStream.shared.onNext($location.search())
	})

	return QueryParamsStream.shared
}