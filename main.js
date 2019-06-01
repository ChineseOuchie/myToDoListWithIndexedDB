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

function renameListById(id, newName) {
	return db.list.where('id').equals(id).modify((value) => {
		value.name = newName;
	});
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
					<button class="rename" data-rename-id="${element.id}">Rename</button>
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

			const renameList = document.querySelectorAll('.rename');
			const renameListInput = document.getElementById('rename-list');
			const renameListButton = document.getElementById('rename-list-button');
			const renameParent = document.getElementById('rename-parent');

			renameList.forEach(element => {
				element.addEventListener('click', () => {
					renameParent.classList.add('rename-active');
					renameListInput.value = '';
					
					renameListButton.addEventListener('click', function doRename() {
						const renameId = parseInt(element.dataset.renameId);

						renameListById(renameId, renameListInput.value).then(() => {
							renameParent.classList.remove('rename-active');
							renameListInput.value = '';
							renameListButton.removeEventListener('click', doRename);

							loadData();
						});
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
