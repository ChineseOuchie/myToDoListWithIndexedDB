let db = new Dexie('toDoDB');
db.version(1).stores({
	list: '++id, name, active',
	task: '++id, name, listId'
});

function addList(data = {name}) {
	return db.list.add(
		{
			name: data.name,
			active: 0,
		}
	);
}

function getLists() {
	return db.list.toArray();
}

function getActiveList() {
	return db.list.where({active: 1}).first(list => {
		return list;
	});
}

function setActiveList(id) {
	return db.list.update(id, {active: 1}).then((updated) => {
		if (updated) {
			return true;
		}
		else {
			return false;
		}
	});
}

function removeAllActiveList() {
	return db.list.where('active').equals(1).modify(function(value) {
		value.active = 0;
	});
	
}

function isAnyListActivated() {
	return db.list.where('active').equals(1).count((count) => {
		return count;
	});
}

function deleteListById(id) {
	return db.list.delete(id);
}

document.addEventListener('DOMContentLoaded', () => {
	const lists = document.getElementById('lists');
	const listName = document.getElementById('listName');
	const listSubmit = document.getElementById('submitList');

	function loadData() {
		getLists().then((result) => {
			lists.innerHTML = ``;
			result.forEach(element => {
				lists.innerHTML += `
				<div class="item" data-list-id="${element.id}">
					<div >${element.name}</div>
					<button class="remove" data-delete-id="${element.id}">Delete</button>
				</div>
				`;
			});

			const listItems = document.querySelectorAll('.item');

			listItems.forEach(element => {
				element.addEventListener('click', () => {
					// Remove active class from all lists.
					listItems.forEach(element => {
						element.classList.remove('active');
					});
					const listId = parseInt(element.dataset.listId);

					// Check for active list.
					isAnyListActivated().then((count) => {
						if (count) {
							// Remove all active list.
							return removeAllActiveList().then((removed) => {
								if (removed) {
									// Set clicked list as active.
									return setActiveList(listId).then((activated) => {
										if (activated) {
											element.classList.add('active');
											return true;
										} else {
											return false;
										}
									});
								} else {
									return false;
								}
							});
						} else {
							// Set clicked list as active if no active list has been found.
							return setActiveList(listId).then((activated) => {
								if (activated) {
									element.classList.add('active');
									return true;
								} else {
									return false;
								}
							});
						}
					});
				});
			});

			const listDelete = document.querySelectorAll('.remove');

			listDelete.forEach(element => {
				element.addEventListener('click', () => {
					const listId = parseInt(element.dataset.deleteId);

					deleteListById(listId).then(() => {
						loadData();
					});
				});
			});

		});

		getActiveList().then((result) => {
			if (result) {
				const listItems = document.querySelectorAll('.item');
	
				listItems.forEach(element => {
					if (parseInt(element.dataset.listId) === result.id) {
						element.classList.add('active');
						
					} else {
						element.classList.remove('active');
					}
				});
			}
		});
	}

	loadData();

	listSubmit.addEventListener('click', () => {
		const listNameValue = listName.value;
		addList({name: listNameValue}).then(() => {
		loadData();

		}).catch((error) => {
			console.log(error);
		});
	});

});









































// function addPeople(data = {name, age, dead}) {
// 	return db.people.add(
// 		{
// 			name: data.name,
// 			age: data.age,
// 			dead: data.dead,
// 		}
// 	);
// }

// function getPeoples() {
// 	return db.people.toArray();
// }


// document.addEventListener('DOMContentLoaded', () => {
// 	const lists = document.getElementById('lists');

// 	const name = document.getElementById('name');
// 	const age = document.getElementById('age');
// 	const dead = document.getElementById('dead');
// 	const submit = document.getElementById('submit');
// 	const message = document.getElementById('message');


// 	function loadData() {
// 		getPeoples().then((item) => {
// 			lists.innerHTML = '';
// 			item.forEach(result => {
// 				lists.innerHTML += `
// 					<div class="item">
// 						<div>${result.id}</div>
// 						<div>${result.name}</div>
// 						<div>${result.age}</div>
// 						<div>${result.dead}</div>
// 						<div class="delete" data-delete-id="${result.id}">Delete</div>
// 					</div>
// 				`;
// 			});

// 			const deleteButton = document.querySelectorAll('.delete');

// 			deleteButton.forEach(element => {
// 				element.addEventListener('click', () => {
// 					db.people.where('id').equals(parseInt(element.dataset.deleteId)).delete();
// 					loadData();
// 				});
// 			});
// 		});
// 	}

// 	submit.addEventListener('click', () => {
// 		addPeople({
// 			name: name.value,
// 			age: age.value,
// 			dead: dead.value,
// 		}).then((result) => {
// 			if (result) {
// 				message.innerHTML = 'Added';

// 				loadData();
// 			}
// 		}).catch((error) => {
// 			message.innerHTML = 'Error: ' + error;
// 		}) ;
// 	});

// 	loadData();

// });
