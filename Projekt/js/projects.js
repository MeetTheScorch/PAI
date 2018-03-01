app.controller('Projects', ['$http', 'common', 'globals',
	function($http, common, globals) {
		
		console.log("Projects controller starting");
		
		var self = this;
		self.confirm = common.confirm;
		self.loggedUser = globals.session.user; 
		
		self.project = {};		
		
		self.refresh = function() {
			$http.get('/db/persons/').then(
				function(response) {
					self.persons = response.data;
				},
				function(errResponse) {
					self.persons = [];
				}
			);
			
			$http.get('/db/projects/').then(
				function(response) {
					self.projects = response.data;
				},
				function(errResponse) {
					self.projects = [];
				}
			);
		}
		
		self.refresh();
		
		self.hasRights = function(rights) {
			
			if(rights && self.loggedUser) {
				var arr1 = self.loggedUser.roles.split('');
				var arr2 = rights.split('');
				for(var i in arr1) {
					for(var j in arr2) {
						if(arr1[i] == arr2[j]) {
							return true;
						}
					}
				}
			}
			return false;
		}
		
		self.insert = function() {
			console.log('ctrl.insert(), ' + self.project);
			$http.post('/db/projects/json', self.project).then(
				function(response) {
					self.refresh();
				},
				function(errResponse) {
					console.log(JSON.stringify(errResponse));
				}
			);
		}

		self.edit = function(id = '', managerId = '') {
			if(id) {
				if(self.loggedUser._id == managerId || self.hasRights('S')){
					$http.get('/db/projects/' + id).then(
						function(response) {
							self.project = response.data[0];
							$("#editProject").modal();			
						},
						function(errResponse) {}
					);
				}
			} else {
				if(self.hasRights('SM')){
					self.project = {};
					$("#editProject").modal();
					self.project.managerId = self.loggedUser._id;
				}
			}
		}
		
		self.editSubmit = function() {
			var projectGelded = self.project;
			delete projectGelded.manager;
			console.log('ctrl.editSubmit(), ' + projectGelded);
			if(projectGelded._id) {
				$http.put('/db/projects/' + projectGelded._id, projectGelded).then(
					function(response) {
						self.refresh();
					},
					function(errResponse) {
						console.log(JSON.stringify(errResponse));
					}
				);
			} else {
				$http.post('/db/projects/json', projectGelded).then(
					function(response) {
						self.refresh();
					},
					function(errResponse) {
						console.log(JSON.stringify(errResponse));
					}
				);				
			}
			$('#editProject').modal('hide');
		}

		self.confirmRemove = function(project) {
			$('#editProject').modal('hide');
			common.confirm.text = 'Are you sure to delete a project "' + self.project.name + '" ?';
			common.confirm.action = self.remove;
			$("#confirmDialog").modal();
		}
		
		self.remove = function() {
			$("#confirmDialog").modal('hide');
			if(self.project._id) {
				$http.delete('/db/projects/' + self.project._id).then(
					function(response) {
						self.refresh();
					},
					function(errResponse) {
						console.log(JSON.stringify(errResponse));
					}
				);
				$('#editProject').modal('hide');
			}
		}
		
	}
]);