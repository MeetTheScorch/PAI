app.controller('Tasks', ['$http', 'common', 'globals',
	function($http, common, globals) {
		
		console.log("Tasks controller starting");
		
		var self = this;
		self.confirm = common.confirm;
		self.loggedUser = globals.session.user; 
		self.statusName = common.statusName;
		
		self.task = {};
		
		self.statusesList = [0, 1, 2, 3, 4];
			
		
		self.refresh = function() {
			$http.get('/db/tasks/projectId=' + self.project._id).then(
				function(response) {
					var tasks = response.data;
					for(var k in tasks) {
						tasks[k].deadline = new Date(tasks[k].deadline);
					}
					self.tasks = tasks;
				},
				function(errResponse) {
					self.tasks = [];
				}
			);
			self.fillData();
		}
		
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
		
		$http.get('/db/projects/').then(
			function(response) {
				self.projects = response.data;
				self.project = response.data[0];	
				self.refresh();
			},
			function(errResponse) {
				self.projects = [];
				self.project = [];
			}
		);
		
		$http.get('/db/persons').then(
			function(response) {
				self.persons = response.data;
			},
			function(errResponse) {
				self.persons = [];
			}
		);
		
		self.getPerson = function(workerId){
			for(var i in self.persons){
				if(workerId == self.persons[i]._id){
					return (self.persons[i].firstName + " " + self.persons[i].lastName);
				}
			}		
		}
		
		self.insert = function() {
			console.log('ctrl.insert(), ' + self.task);
			$http.post('/db/tasks/json', self.task).then(
				function(response) {
					self.refresh();
				},
				function(errResponse) {
					console.log(JSON.stringify(errResponse));
				}
			);
		}

		self.edit = function(id = '') {
			if(self.loggedUser._id == self.project.managerId){
				if(id) {
					self.availableProjects = self.projects;
					$http.get('/db/tasks/' + id).then(
						function(response) {
							self.task = response.data[0];
							switch(self.task.status){
								case 0:
									self.statusesList = [0, 1, 4];
									break;
								case 1:
									self.statusesList = [1, 2, 4];
									break;
								case 2:
									self.statusesList = [1, 2, 3, 4];
									break;
								case 3:
									self.statusesList = [3, 4];
									break;
								case 4:
									self.statusesList = [4];
									break;
								default:
									self.statusesList = [0, 1, 2, 3, 4];
									break;
							}
							self.task.deadline = new Date(self.task.deadline);
							$("#editTask").modal();			
						},
						function(errResponse) {}
					);
				} else {
					self.availableProjects = [];
					for(var i in self.projects){
						if(self.loggedUser._id == self.projects[i].managerId){
							self.availableProjects.push(self.projects[i]);
						}
					}
					self.task = { status: 0, projectId: self.project._id };
					$("#editTask").modal();
				}
			}
		}
		
		self.editSubmit = function() {
			var taskGelded = self.task;
			delete taskGelded.manager;
			delete taskGelded.project;
			delete taskGelded.workers;
			delete taskGelded.dependsOn;
			console.log('ctrl.editSubmit(), ' + JSON.stringify(taskGelded));
			if(taskGelded._id) {
				$http.put('/db/tasks/' + taskGelded._id, taskGelded).then(
					function(response) {
						self.refresh();
					},
					function(errResponse) {
						console.log(JSON.stringify(errResponse));
					}
				);
			} else {
				$http.post('/db/tasks/json', taskGelded).then(
					function(response) {
						self.refresh();
					},
					function(errResponse) {
						console.log(JSON.stringify(errResponse));
					}
				);				
			}
			$('#editTask').modal('hide');
		}

		self.confirmRemove = function(task) {
			$('#editTask').modal('hide');
			common.confirm.text = 'Are you sure to delete a task "' + self.task.description + '" ?';
			common.confirm.action = self.remove;
			$("#confirmDialog").modal();
		}
		
		self.remove = function() {
			$("#confirmDialog").modal('hide');
			if(self.task._id) {
				$http.delete('/db/tasks/' + self.task._id).then(
					function(response) {
						self.refresh();
					},
					function(errResponse) {
						console.log(JSON.stringify(errResponse));
					}
				);
				$('#editTask').modal('hide');
			}
		}
	}
]);