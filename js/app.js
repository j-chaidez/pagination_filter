var Core = Core;

var lastLength = 0;

/* 
   
   searchStudents is responsible for managing how searches are handled. Since the button that is clicked and the search input
   are both contained within the same div, it finds the parentElement of the button that is clicked, then finds the first child
   node (tried firstChild, didn't work). In this case, that would be zero. I do it this way so I can use the same method for both the keyup and the 
   button click. Once searchStudents is called, it checks whether or not the searchText value length is greater than zero. If
   it is greater than zero, then we pass the trimmed searchText into app.init; if not, we pass no parameter and get the default
   results.

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
   recursively, studentList's opacity is checked to see if it has reached its limit. Once it has, it just returns 
   an arbitrary value to break out of the function. If the opacity value has not reached its limit, animate proceeds
   to the second else block. This creates a setTimeout function that executes an anonymous function that passes in the
   modified parameter values of the animate function. A timer of 0.2 (or 2 ms) is set, and the function is repeated until
   the if condition is satisfied. Finally, studentList's opacity becomes the sum of add EACH time the function is run, which
   is why it's separate from any of the conditional blocks. 
   
*/

function animate(studentList, add) {
	add += 0.01;
	if (studentList.style.opacity >= 1) {
		return 0;
	} else {
		setTimeout(function() { animate(studentList, add); }, 0.2);
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
	};
	
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
			
			// creates a test for special characters
			var specials = !/[~`!#$%\^&*+=\-\\(\)[\]\\';,/{}|\\":<>\?]/g.test(search);
			var newStudents = [];
			var studentName, studentEmail;
			
			
			if (search !== undefined) {
				var test;
				//if block to see if any special characters are used
				
				if (specials) {
					test = new RegExp(search, 'i');
				} else {
					document.getElementsByTagName('input')[0].value = "";
					test = new RegExp('x', 'i');
				}
				
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
		   then it knows that no search results were returned by modifyStudents. At this point, it creates an H2 element with 
		   "No results found" as the innerHTML, appends it to page, and then returns 0. 
		   
		 */
		   
		showStudents: function() {
			var studentList = _.getElementsByClass('student-list')[0];
			var pagination = _.getElementsByClass('pagination')[0];
			var noResults = _.getElementsByClass('no-results')[0];
			var currentLength = students.length;
			
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
			
			
		/*
		
			If the length of students is not equal to zero, then it knows that there are student objects that can be added to the page.
			First, studentUL creates an element of "UL", then _.addClass assigns the class of 'student-list' to that UL. The starting position
			is determined by looking at the innerHTML of this, which in this case is the 'a' node that was clicked. It then takes and 
			parses the integer from the innerHTML of the element, subtracts one, and multiplies that by 10 to determine the start. 
			For instance, if you were to click on the number 2 link, the starting point for the students collection would be 10, which is actually (2 - 1) * 10.
			Lastly, it checks to see if start is NaN. This is used for when the application initially starts as this.innerHTML would return
			undefined. End is similar. It will add 9 to start to determine the ending point for the upcoming for loop. Since array index
			starting at 0, students 1 - 10 would actually be 0 - 9. If end is greater than students length, it knows that the end has been reached,
			so it stores the value of students.length - 1 inside of end.
			
		*/
		
			var studentUL = document.createElement("UL");
			_.addClass(studentUL, "student-list");
			var start = (parseInt(this.innerHTML) - 1) * 10;
			if (isNaN(start)) {
				start = 0;
			}
			
		
			var end = start + 9;
			if (end > students.length) {
				end = students.length - 1;
			}
			
			// Use a for loop to iterate over the students collection, then based on the start and end acquired earlier, appendChild
			// those students to the studentUL
			
			for (var i = 0; i < students.length; i++) {
				if (i >= start && i <= end) {
					studentUL.appendChild(students[i]);
				}
			}
			
			// Append studentUL to the page
			page.appendChild(studentUL);
			// Call the createPageLinks function
			app.createPageLinks();
			// Call the addAnchorListeners function	
			app.addAnchorListeners();
			// I'm animating the 'student-list' class here, so I need to capture that element, set its opacity, and pass it into the 
			
			studentList = _.getElementsByClass('student-list')[0];
			
			if (this.nodeName === 'A') {
				lastLength = 0;
			}
			
			if (currentLength !== lastLength) {
				studentList.style.opacity = 0;
				animate(studentList, 0.01);
			}
			
			lastLength = students.length;
			
		/*
		
			This really should be moved to its own function definition. This creates a hyperlink variable that contains
			collection of HTML 'a' objects. It then iterates through each object to detect its innerHTML. If the innerHTML
			matches the hyperlink objected located at index 'lnk', it then attaches the class of active. When you click on 
			any pagination link, that link will be attributed the class of 'active'. Upon initially starting, this.innerHTML 
			will be equal to 'undefined' since no 'a' object has been selected. If this is the case, it's safe to assume that '1'
			will be the selected page, so 'active' is added to the first 'a' object and 0 is returned to break out of the 
			function.
		
		*/
		
			var hyperlink = document.getElementsByTagName('a');
			for (var lnk in hyperlink) {
				if (hyperlink[lnk].innerHTML == this.innerHTML) {
					_.addClass(hyperlink[lnk], 'active');
				} else if (this.innerHTML === undefined) {
					_.addClass(hyperlink[lnk], 'active');
					return 0;
				}
			}
			
		},
		
		/*
		
			appendSearchBar begins by targeting the page-header class. It then creates a div, an input, and a button (for searching).
			It then modifies the innerHTML of the searchButton, puts a placeholder on the searchInput, and appends each HTML element
			to the searchBarDiv. the class 'student-search' is added to the searchBarDiv, and then searchBarDiv is appended to the 
			pageHeader.
			
		
		*/
		
		appendSearchBar: function() {
			
			var pageHeader = _.getElementsByClass("page-header")[0];
			var searchBarDiv = document.createElement("DIV");
			var searchInput = document.createElement("INPUT");
			var searchButton = document.createElement("BUTTON");
			searchButton.innerHTML = "Search";
			searchInput.placeholder = "Search for students...";
			searchBarDiv.appendChild(searchInput);
			searchBarDiv.appendChild(searchButton);
			_.addClass(searchBarDiv, "student-search");
			pageHeader.appendChild(searchBarDiv);
			
		},
		/*
		
			createPageLinks starts by creating a pagination div, and an unordered list that is used for the pagination list.
			It adds the class of "pagination" to the pagination div, and then it checks to see if the totalPages is equal to 1.
			If it is, then it just returns 0 because there is no need to paginate results when there are 10 or less students.
			If totalPages is greater than one, then a for loop is initiated. This for loop will iterate over the totalPages, and
			for each it will create an LI element, and an A element. Each link's href is just equal to "#", so it attributes
			"#" to each href attribute of the pageLink ("A"). After that, it sets the innerHTML of 'A' equal to the value of 'i'.
			It then appends the pageLink child to the pageLinkContainer. After all of that is done, the it appends the paginationList
			to the paginationDiv. Finally, it appends the paginationDiv to the 'page'.
		
		*/
		
		createPageLinks: function() {
			
			var paginationDiv = document.createElement("DIV");
			var paginationList = document.createElement("UL");
			_.addClass(paginationDiv, "pagination");
			if (totalPages === 1) { return 0; }
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
		
		/*
		
			addAnchorListeners first checks to see if 'pagination' has any childNodes. If it does, then paginationDiv becomes
			a collection of those nodes. If not, 0 is returned and the function is escaped. Then, links is set to be paginationDiv[0]'s
			childNodes collection. For each link inside of links, target is assigned the current index links lastChild, and if the target 
			is not equal to undefined, a click event listener is added that calls showStudents.
		
		*/
		
		addAnchorListeners: function() {
			
      var paginationDiv;
      
			try { 
				paginationDiv = _.getElementsByClass("pagination")[0].childNodes;
			} catch (err) {
				return 0;
			}
			
			var links = paginationDiv[0].childNodes;
			for (var link in links) {
        if (link) {
          var target = links[link].lastChild;
          if (target !== undefined) {
            _.addEventListener(target, 'click', this.showStudents);
          } else {
            continue;
          }
        }
			}
		},
	
	};
	
}(Core));

// initialize the app and call the appropriate methods
app.init();
app.appendSearchBar();
// addEventListeners for the search bar
Core.addEventListener(document.getElementsByTagName('button')[0], 'click', searchStudents);
Core.addEventListener(document.getElementsByTagName('input')[0], 'keyup', searchStudents);
