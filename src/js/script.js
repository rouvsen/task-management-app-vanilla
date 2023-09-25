var addMemberButton = document.getElementById("add-member-button");
var dialog = document.getElementById("dialog");
var closeDialogButton = document.getElementById("close-dialog-button");
var cancelDialogButton = document.getElementById("cancel-dialog-button");
var saveDialogButton = document.getElementById("save-dialog-button");
var memberNameInput = document.getElementById("member-name-input");
var memberImageInput = document.getElementById("member-image-input");

function imageToBase64(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() {
            resolve(reader.result);
        };
        reader.onerror = function() {
            reject(reader.error);
        };
        reader.readAsDataURL(file);
    });
}

async function saveMember(name, image) {
    try {
        var data = {name: name, photo: image};

        var response = await fetch("http://localhost:3001/members", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Member saved successfully!");
        } else {
            alert("Something went wrong!");
        }
    } catch (error) {
        alert("Request failed!");
    }
}

addMemberButton.addEventListener("click", function() {
    dialog.style.display = "block";
});

closeDialogButton.addEventListener("click", function() {
    dialog.style.display = "none";
});

cancelDialogButton.addEventListener("click", function() {
    dialog.style.display = "none";
    memberNameInput.value = "";
    memberImageInput.value = "";
});

saveDialogButton.addEventListener("click", async function(event) {
    event.preventDefault();

    if (memberNameInput.checkValidity() && memberImageInput.checkValidity()) {
        var base64 = await imageToBase64(memberImageInput.files[0]);

        saveMember(memberNameInput.value, base64);
    } else {
        alert("Please enter a valid name and image!");
    }
});

var modal = document.getElementById("myModal");
var btn = document.getElementById("createTaskBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

async function loadMembers() {
    try {
        const response = await fetch('http://localhost:3001/members');
        const members = await response.json();
        const select = document.getElementById('assignment');
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

loadMembers();

var form = document.getElementById("taskForm");

form.onsubmit = async function(event) {
    event.preventDefault();

    var name = form.elements["name"].value;
    var description = form.elements["description"].value;
    var date = form.elements["date"].value;
    var assignment = form.elements["assignment"].value;

    var task = {
        name: name,
        description: description,
        date: date,
        boardId: 1,
        assignMemberId: assignment
    };

    try {
        const response = await fetch('http://localhost:3001/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        const newTask = await response.json();
        console.log('New task created:', newTask);

        modal.style.display = "none";
        form.reset();

    } catch (error) {
        console.error('Error creating new task:', error);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

async function drop(event, boardId) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const targetBoardId = boardId;
    const taskId = data.replace('task-', '');

    try {
        const response = await fetch(`http://localhost:3001/tasks/${taskId}`);
        const task = await response.json();
        task.boardId = targetBoardId;

        await fetch(`http://localhost:3001/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        console.log('Task updated:', task);

        const taskElement = document.getElementById(data);
        const targetBoard = document.getElementById(`board-${targetBoardId}`);
        targetBoard.appendChild(taskElement);

    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function loadTasks() {
    try {
        const response = await fetch('http://localhost:3001/tasks');
        const tasks = await response.json();
        
        const responseMem = await fetch('http://localhost:3001/members');
        const members = await responseMem.json();
        
        const filterInput = document.getElementById('filter');
        const filterValue = filterInput.value.trim().toLowerCase();
        
        tasks.forEach(task => {

            const taskName = task.name.toLowerCase();

            if (filterValue && !taskName.includes(filterValue)) return;
            
            const board = document.getElementById(`board-${task.boardId}`);
            const taskElement = document.createElement('div');
            taskElement.id = `task-${task.id}`;
            taskElement.className = 'task';
            taskElement.draggable = true;

            const taskNameDiv = document.createElement('div');
            taskNameDiv.className = 'task-name';
            taskNameDiv.textContent = task.name;
            taskElement.appendChild(taskNameDiv);

            const taskDate = document.createElement('div');
            taskDate.className = 'task-date';
            taskDate.textContent = task.date;
            taskElement.appendChild(taskDate);

            const taskDesc = document.createElement('div');
            taskDesc.className = 'task-desc';
            taskDesc.textContent = task.description;
            taskElement.appendChild(taskDesc);
            
            const taskAssignment = document.createElement('div');
            taskAssignment.className = 'task-assignment';
            const member = members.find(m => m.id == task.assignMemberId);
            const img = document.createElement('img');
            img.src = member.photo;
            img.alt = member.name;
            taskAssignment.appendChild(img);

            const span = document.createElement('span');
            span.textContent = member.name;
            taskAssignment.appendChild(span);

            taskElement.appendChild(taskAssignment);

            taskElement.addEventListener('dragstart', drag);

            board.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

loadTasks();

fetch("http://localhost:3001/members")
.then(response => response.json())
.then(devData => devData.reverse())
.then(data => {
  let container = document.getElementById("container");
  let maxPhotos = 3;
  for (let i = 0; i < data.length; i++) {
    let member = document.createElement("div");
    member.classList.add("member");
    if (i == maxPhotos && data.length > maxPhotos) {
      member.classList.add("count");
      member.textContent = "+" + (data.length - maxPhotos);
      container.appendChild(member);
      break;
    } else {
      let img = document.createElement("img");
      img.src = data[i].photo;
      member.appendChild(img);
    }
    container.appendChild(member);
  }
})
.catch(error => {
  console.error(error);
});
