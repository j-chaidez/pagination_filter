/* 
   
   searchStudents is responsible for managing how searches are handled. Since the button that is clicked and the search input
   are both contained within the same div, it finds the parentElement of the button that is clicked, then finds the first child
   node (tried firstChild, didn't work). In this case, that would be zero. I do it this way so I can use the same method for both the keyup and the 
   button click. Once searchStudents is called, it checks whether or not the searchText value length is greater than zero. If
   it is greater than zero, then we pass the trimmed searchText into app.init; if not, we pass no parameter and get the default
   results

*/

function searchStudents() {
	var searchText = this.parentElement.childNodes[0].value;
	if (searchText.length > 0) {
		app.init(String(searchText.trim()));
	} else {
		app.init();
	}
}

/*

   animate takes the parameter studentList and the parameter add. studentList is the HTML class 'student-list', add
   is an integer parameter that is initially zero. add is incremented by 0.01. Then, since this function is run 
   recursively, studentList's opacity is check to see if it has reached its limit. Once it has, it just returns 
   an arbitrary value to break out of the function. If the opacity value has not reached its limit, animate proceeds
   to the second else block. This creates a setTimeout function that executes an anonymous function that passes in the
   modified parameter values of the animate function. A timer of 0.2 (or 2 ms) is set, and the function is repeated until
   the if condition is satisfied. Finally, studentList's opacity becomes the sum of add EACH time the function is run, which
   is why it's separate from any of the conditional blocks. 
   
*/

function animate(studentList, add) {
	add += 0.01
	if (studentList.style.opacity >= 1) {
		return 0;
	} else {
		setTimeout(function() { animate(studentList, add) }, 0.2);
	}
	studentList.style.opacity = add;
}

/* 

   I really wanted to practice using the module JavaScript pattern with this project. The module pattern creates a self-executing
   anonymous function that returns an object that can be used as a public API, while any variables of methods declared
   outside of the returned object are assumed to be private and can only be modified or accessed by the returned object. 
   This is useful because it creates a 'self-contained universe', where any objects, methods, or variables created do not pollute
   or effect the global scope, thereby eliminating (or alleviating) the possibility of naming conflicts and accidental variable
   assignment that may effect one or more operations of the program.
   
*/

var app = (function(_) {
	
	/* 
	   The ceil function is pretty straight-forward. It takes the array of objects called 'students', and then returns length
	   value divided by ten rounded up to the nearest whole integer. This is used later on in determining the number of 
	   pagination links that will be provided to the page
	 
	*/
	
	var ceil = function(students) {
		return Math.ceil(students.length / 10);
	}
	
	/* 
	
	   Starting from the top, we have preservedStudents. This is an HTML collection that contains ALL of the students on the
	   page. students is an empty array that is populated with student objects; it's used by numerous functions. page is 
	   the actual 'page' div itself. Lastly, totalPages is the total number of page links that will be added to pagination.
	   
	*/
	   
	var preservedStudents = _.getElementsByClass("student-item");
	var students = [];
	var page = _.getElementsByClass("page")[0];
	var totalPages = ceil(students);
    
	// The public API I mentioned earlier
	return {
		
		/*
		
			init takes a parameter search, (refer to searchStudents for more information), and passes it into modifyStudents. 
			It then executes the showStudents function. 'this', in this case, refers to 'app'. In fact, 'app' could easily be 
			used in place of 'this', but I used this because it's easier and makes more sense to me.
			
		*/
		
		init: function(search) {
			this.modifyStudents(search);
			this.showStudents();
		},
		
		/* 
		   
		   modifyStudents takes the parameter search, creates a newStudents array, a studentName variable, and a studentEmail
		   variable. If search is not equal to undefined, variable test, which is a regular expression containing the search text with i passed as
		   an option to ignore case, is created. A for loop is initiated, and this iterates over the preservedStudents array.
		   studentName is assigned the student name, and studentEmail is assigned the e-mail. A test is run on studentName or
		   studentEmail to see if any characters within the search text match. If a match is found, it is pushed to the 
		   newStudents array. else, if search is equal to undefined, we pass the value of preservedStudents to newStudents.
		   students is assigned the value of newStudents, and the total number of pages is determined for pagination use. 
		   
		*/
		
		modifyStudents: function(search) {
			
			var newStudents = [];
			var studentName, studentEmail;
			
			if (search !== undefined) {
				
				var test = new RegExp(search, 'i');
				for (var i = 0; i < preservedStudents.length; i++) {
					studentName = preservedStudents[i].children[0].children[1].innerHTML;
					studentEmail = preservedStudents[i].children[0].children[2].innerHTML;
					if (test.exec(studentName) || test.exec(studentEmail)) {
						newStudents.push(preservedStudents[i]);
						
					}
				}
				
			} else {
				
				newStudents = preservedStudents;
				
			}
			
			students = newStudents;
			totalPages = ceil(students);
		},
		
		/* 
		   showStudents is responsible for most of the heavy-lifting. First, a studentList variable is assigned the HTML object of class
		   'student-list'. To do this, I use the Core library (https://www.sitepoint.com/simply-javascript-the-core-library/).
		   This library mitigates some cross-browser inconsistencies and bugs when it comes to performing certain DOM operations.
		   Secondly, pagination is assigned the HTML object of class 'pagination'. Thirdly, noResults is assigned the HTML object 
		   of class 'no-results'. At any one time, depending on what is going on within the program, some of these objects will not
		   exist. To prevent errors, it checks if each one is NOT equal to undefined. If that is the case, then we know that we can 
		   remove it from the page. If not, nothing happens. After this, students.length is checked. If this is less equal to zero,
		   then it knows that no search results were returned by modifyStudents. At this point, it creates an H2 element . . . 
		 
		 */
		   
		showStudents: function() {
			var studentList = _.getElementsByClass('student-list')[0];
			var pagination = _.getElementsByClass('pagination')[0];
			var noResults = _.getElementsByClass('no-results')[0];
			
			if (studentList !== undefined) {
				page.removeChild(studentList);
			}
			
			if (pagination !== undefined) {
				page.removeChild(pagination);
			}
			
			if (noResults !== undefined) {
				page.removeChild(noResults);
			}
			
			if (students.length === 0) {
				var notification = document.createElement("H2");
				_.addClass(notification, "no-results");
				notification.innerHTML = "No results found";
				page.appendChild(notification);
				return 0;
			}
			
			var studentUL = document.createElement("UL");
			_.addClass(studentUL, "student-list");
			var start = (parseInt(this.innerHTML) - 1) * 10
			if (isNaN(start)) {
				start = 0;
			}
			
			var end = start + 9;
			if (end > students.length) {
				end = students.length - 1;
			}
			
			for (var i = 0; i < students.length; i++) {
				if (i >= start && i <= end) {
					studentUL.appendChild(students[i]);
				}
			}
			
			page.appendChild(studentUL);
			app.createPageLinks();
			app.addAnchorListeners();
			var studentList = Core.getElementsByClass('student-list')[0];
			studentList.style.opacity = 0;
			animate(studentList, 0.01);
			
		},
		
		appendSearchBar: function() {
			
			var pageHeader = _.getElementsByClass("page-header")[0];
			var searchBarDiv = document.createElement("DIV");
			var searchInput = document.createElement("INPUT");
			var searchButton = document.createElement("BUTTON")
			searchButton.innerHTML = "Search";
			searchInput.placeholder = "Search for students...";
			searchBarDiv.appendChild(searchInput);
			searchBarDiv.appendChild(searchButton);
			_.addClass(searchBarDiv, "student-search");
			pageHeader.appendChild(searchBarDiv);
			
		},
		
		createPageLinks: function() {
			
			var paginationDiv = document.createElement("DIV");
			var paginationList = document.createElement("UL")
			_.addClass(paginationDiv, "pagination");
			if (totalPages === 1) { return 0; };
			for (var i = 1; i <= totalPages; i++) {
				var pageLinkContainer = document.createElement("LI");
				var pageLink = document.createElement("A");
				pageLink.href = "#";
				pageLink.innerHTML = i;
				pageLinkContainer.appendChild(pageLink);
				paginationList.appendChild(pageLinkContainer);
			}
			
			paginationDiv.appendChild(paginationList);
			_.getElementsByClass('page')[0].appendChild(paginationDiv);
		},
		
		addAnchorListeners: function() {
			
			try { 
				var paginationDiv = _.getElementsByClass("pagination")[0].childNodes;
			} catch (err) {
				return 0;
			}
			
			var links = paginationDiv[0].childNodes;
			for (var link in links) {
				var target = links[link].lastChild;
				if (target !== undefined) {
					_.addEventListener(target, 'click', this.showStudents);
				} else {
					continue;
				}
			}
		},
	
	}
	
}(Core));

app.init();
app.appendSearchBar();
Core.addEventListener(document.getElementsByTagName('button')[0], 'click', searchStudents);
Core.addEventListener(document.getElementsByTagName('input')[0], 'keyup', searchStudents);
