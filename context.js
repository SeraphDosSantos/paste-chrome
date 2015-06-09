function publish(content, font) {
	var http = new XMLHttpRequest();
	var url = "https://write.as/api/";
	var params = "w=" + encodeURIComponent(content) + "&font=" + font;
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4) {
			if (http.status == 200) {
				data = http.responseText.split("\n");
				// Pull out data parts
				url = data[0];
				id = url.substr(url.lastIndexOf("/")+1);
				editToken = data[1];
				
				// Save the data
				posts = JSON.parse(H.get('posts', '[]'));
				posts.push({id: id, token: editToken});
				H.set('posts', JSON.stringify(posts));
				
				// Launch post
				chrome.tabs.create({ url: url });
			} else {
				alert("Failed to post. Please try again.");
			}
		}
	}
	http.send(params);
}

function getSelectedText(callback) {
	// Workaround since info.selectionText in context menu click handler doesn't
	// preserve newlines.
	// Source: https://code.google.com/p/chromium/issues/detail?id=116429#c11
	chrome.tabs.executeScript({
		code: "window.getSelection().toString();"
	}, function(selection) {
		callback(selection[0]);
	});
}

function publishText(info, tab) {
	getSelectedText(function(sel) {
		publish(sel, "norm");
	});
}

function publishTextSans(info, tab) {
	getSelectedText(function(sel) {
		publish(sel, "sans");
	});
}

function publishCode(info, tab) {
	getSelectedText(function(sel) {
		publish(sel, "code");
	});
}

chrome.contextMenus.create({"title": "Publish text (sans)", "contexts": ["selection", "editable", "link"], "onclick": publishTextSans});
chrome.contextMenus.create({"title": "Publish text (serif)", "contexts": ["selection", "editable", "link"], "onclick": publishText});
chrome.contextMenus.create({"title": "Publish code", "contexts": ["selection", "editable", "link"], "onclick": publishCode});
