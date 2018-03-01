app.controller('Home', ['$http', 'common', 'globals',
	function($http, common, globals) {	
	
		console.log('Home page controller started');
		
		var self = this;
		self.globalsHandler = globals;
		self.confirm = common.confirm;
		self.loggedUser = globals.session.user; 
		
		self.description = 'Project Management System description.';
		
	}
]);