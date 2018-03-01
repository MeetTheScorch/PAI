app.controller('Chart', ['$http', 'common', 'globals',
	function($http, common, globals) {	

		console.log('Chart page controller started');

		var self = this;
		self.confirm = common.confirm;
		self.loggedUser = globals.session.user; 
		
		self.data = [];
		var tasksCount = [];
		
		
		self.refresh = function() {
			self.fillData();
		}
		
		self.options = {

			chart: {
				type: 'discreteBarChart',
				height: 300,
				margin: { top: 20, right: 20, bottom: 50, left: 55 },
				x: function(d) { return d.label; },
				y: function(d) { return d.value; },
				showValues: true,
				valueFormat: function(d) { return d3.format(',.1f')(d); },
				duration: 500,
				xAxis: { axisLabel: 'Project' },
				yAxis: { axisLabel: 'Tasks', axisLabelDistance: -10 }
			}
				
		};
		
		/*
		//var names = [];
		//var counts = [];
		self.fillData = function () {
			$http.get('/db/projects/').then(
				function(response1) {
					for(var i=0; i<response1.data.length; i++){
						names.push(response1.data[i].name);
						$http.get('/db/tasks/projectId=' + response1.data[i]._id).then(
							function(response2){
								if(response2.data.length > 0){
									counts.push(response2.data.length);
								}
								else{
									counts.push(0);
								}
							},
							function(errResponse2) {}
						);
					}
				},
				function(errResponse1) {}				
			);
			if(tasksCount.length == 0){
				for(var i=0; i<names.length; i++){
					tasksCount.push({ "label" : names[i], "value" : counts[i] });
				}
			}
			if(tasksCount.length != 0){
				self.data[0] = { key : "Tasks per project.", values : tasksCount };
			}
		}*/
		
		self.fillData = function () {
			$http.get('/db/projects/').then(
				function(response1) {
					self.projects = response1.data;
				},
				function(errResponse1) {}				
			);
			$http.get('/db/tasks/').then(
				function(response2) {
					self.tasks = response2.data;
				},
				function(errResponse2) {}				
			);
			if(tasksCount.length < self.projects.length){
				tasksCount = [];
				for(var i in self.projects){
					var count = 0;
					for(var j in self.tasks){
						if(self.projects[i]._id == self.tasks[j].projectId){
							count++;
						}
					}
					tasksCount.push({ "label" : self.projects[i].name, "value" : count });
				}
			}
			self.data[0] = { key : "Tasks per project.", values : tasksCount };
		}
	}
]);