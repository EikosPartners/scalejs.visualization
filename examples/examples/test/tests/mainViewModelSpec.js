
define([
    'mainViewModel',
    'chai',
    'scalejs!core',
    'scalejs.sandbox',
    'scalejs.reactive',
    'scalejs!application'
], function (mainViewModel, chai, core, sandbox) {
	var expect = chai.expect;
	
	
	describe( 'mainViewModel test', function(){
		
		it('VM exists', function(done){
			var vm = mainViewModel();
			expect(vm).not.equal(undefined);
			done();
		});
	});	
});

