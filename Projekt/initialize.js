var debugLog = true;

var dbName = 'pms';

if(debugLog) console.log('Initialization of \'' + dbName + '\'');

var mongojs = require('mongojs');
var db = mongojs(dbName);

db.dropDatabase();

var persons = db.collection('persons');

var personsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), firstName: 'Dmitrii', lastName: 'Mitroshenkov', email: 'dm@dm.com', password: 'dm', roles: 'ASMW' },
	{ _id: mongojs.ObjectId('000000000000000000000002'), firstName: 'Chowdhury', lastName: 'Joy Barua', email: 'jb@jb.com', password: 'jb', roles: 'SM' },
	{ _id: mongojs.ObjectId('000000000000000000000003'), firstName: 'Adrian', lastName: 'Gryza', email: 'ag@ag.com', password: 'ag', roles: 'M' },
	{ _id: mongojs.ObjectId('000000000000000000000004'), firstName: 'Myroslav', lastName: 'Dmukhivskyi', email: 'md@md.com', password: 'md', roles: 'M' },
	{ _id: mongojs.ObjectId('000000000000000000000005'), firstName: 'Patryk', lastName: 'Dudka', email: 'pd@pd.com', password: 'pd', roles: 'AW' },
	{ _id: mongojs.ObjectId('000000000000000000000006'), firstName: 'Igor', lastName: 'Gwiazdowski', email: 'ig@ig.com', password: 'ig', roles: 'W' },
	{ _id: mongojs.ObjectId('000000000000000000000007'), firstName: 'Adrian', lastName: 'Bus', email: 'ab@ab.com', password: 'ab', roles: '' }
];

if(debugLog) console.log('Creating new collection \'persons\'');
for(var i in personsExample) {
	if(debugLog) {
		console.log(JSON.stringify(personsExample[i]));
	}
	persons.insert(personsExample[i]);
}

var projects = db.collection('projects');

var projectsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), name: 'Customer Portal', description: 'http://www.customerportal.com', managerId: mongojs.ObjectId('000000000000000000000003') },
	{ _id: mongojs.ObjectId('000000000000000000000002'), name: 'Co Messenger', description: 'Business oriented communication system', managerId: mongojs.ObjectId('000000000000000000000003') },
	{ _id: mongojs.ObjectId('000000000000000000000003'), name: 'BT-SMS', description: 'Bug tracking system based on SMS', managerId: mongojs.ObjectId('000000000000000000000002') },
	{ _id: mongojs.ObjectId('000000000000000000000004'), name: 'test edycja', description: 'test edycja', managerId: mongojs.ObjectId('000000000000000000000002') },
	{ _id: mongojs.ObjectId('000000000000000000000005'), name: 'project admin', description: 'project admin', managerId: mongojs.ObjectId('000000000000000000000001') }
];

if(debugLog) console.log('Creating new collection \'projects\'');
for(var i in projectsExample) {
	if(debugLog) {
		console.log(JSON.stringify(projectsExample[i]));
	}
	projects.insert(projectsExample[i]);
}

var tasks = db.collection('tasks');

var tasksExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), projectId: mongojs.ObjectId('000000000000000000000002'), description: 'Study', workersIds: [ mongojs.ObjectId('000000000000000000000004'), mongojs.ObjectId('000000000000000000000006') ], dependsOnIds: [], deadline: new Date('2017-12-26T17:00:00.000Z'), status: 0 },
	{ _id: mongojs.ObjectId('000000000000000000000002'), projectId: mongojs.ObjectId('000000000000000000000002'), description: 'Schemas preparation', workersIds: [ mongojs.ObjectId('000000000000000000000006') ], dependsOnIds: [ mongojs.ObjectId('000000000000000000000001') ], deadline: new Date("2018-01-31T17:00:00.000Z"), status: 0 },
	{ _id: mongojs.ObjectId('000000000000000000000003'), projectId: mongojs.ObjectId('000000000000000000000003'), description: 'Project manifest', workersIds: [ mongojs.ObjectId('000000000000000000000005') ], dependsOnIds: [], deadline: new Date("2018-01-30T17:00:00.000Z"), status: 0 },
	{ _id: mongojs.ObjectId('000000000000000000000004'), projectId: mongojs.ObjectId('000000000000000000000003'), description: 'test started', workersIds: [ mongojs.ObjectId('000000000000000000000006') ], dependsOnIds: [], deadline: new Date("2018-01-30T17:00:00.000Z"), status: 1 },
	{ _id: mongojs.ObjectId('000000000000000000000005'), projectId: mongojs.ObjectId('000000000000000000000003'), description: 'test in-tests', workersIds: [ mongojs.ObjectId('000000000000000000000006') ], dependsOnIds: [], deadline: new Date("2018-01-30T17:00:00.000Z"), status: 2 },
	{ _id: mongojs.ObjectId('000000000000000000000006'), projectId: mongojs.ObjectId('000000000000000000000003'), description: 'test completed', workersIds: [ mongojs.ObjectId('000000000000000000000006') ], dependsOnIds: [], deadline: new Date("2018-01-30T17:00:00.000Z"), status: 3 },
	{ _id: mongojs.ObjectId('000000000000000000000007'), projectId: mongojs.ObjectId('000000000000000000000003'), description: 'test cancelled', workersIds: [ mongojs.ObjectId('000000000000000000000006') ], dependsOnIds: [], deadline: new Date("2018-01-30T17:00:00.000Z"), status: 4 },
	{ _id: mongojs.ObjectId('000000000000000000000008'), projectId: mongojs.ObjectId('000000000000000000000005'), description: 'task admin', workersIds: [], dependsOnIds: [], deadline: new Date("2018-01-30T17:00:00.000Z"), status: 0 }
];

if(debugLog) console.log('Creating new collection \'tasks\'');
for(var i in tasksExample) {
	if(debugLog) {
		console.log(JSON.stringify(tasksExample[i]));
	}
	tasks.insert(tasksExample[i]);
}


var events = db.collection('events');

var eventsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), description: '', collection: '', updateType: '', onObject: '', performerId: ''}
];

if(debugLog) console.log('Creating new collection \'events\'');
for(var i in eventsExample) {
	if(debugLog) {
		console.log(JSON.stringify(eventsExample[i]));
	}
	events.insert(eventsExample[i]);
}


if(debugLog) console.log('End of initialization');