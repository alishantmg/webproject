$(document).ready(function() {

    function callController(data, onSuccess){
        $.ajax({
            url: 'controller.php',
            method: 'POST',
            data: data,
            dataType: 'json',
            success: function(data){
                if(typeof onSuccess === 'function'){
                    onSuccess(data);
                }
            },
            error: function() {
                alert('Server error. Please try again');
            }
        });
    }

    if ($('#signin-username').length) {
        callController({command: 'CheckSession'}, function(data) {
            if (data.loggedIn) {
                window.location.href = 'mainPage.html';
            }
        });

        //sign in
        $('#btn-signin').click(function() {
            let username = $('#signin-username').val().trim();
            let password = $('#signin-password').val().trim();
            $('#signin-error').text('');

            if (username === '' || password === '') {
                $('#signin-error').text('Please enter both username and password.');
                return;
            }

            callController({command: 'SignIn', Username: username, Password: password}, function(data) {
                if (data.success) {
                    window.location.href = 'mainPage.html';
                } else {
                    $('#signin-error').text(data.message || 'Login failed. Please try again.');
                }
            });
        });

        //sign up
        $('#btn-signup').click(function() {
            let username = $('#signup-username').val().trim();
            let password = $('#signup-password').val().trim();
            let email = $('#signup-email').val().trim();
            $('#signup-error').text('');
            $('#start-error').text('');
            
            if (username === '' || password === '' || email === '') {
                $('#signup-error').text('Please fill in all fields.');
                return;
            }

            callController({command: 'SignUp', Username: username, Password: password, Email: email}, function(data) {
                if (data.success) {
                    $('#signup-error')
                        .removeClass('text-danger')
                        .addClass('text-success')
                        .text('Signup successful! You can now sign in.');
                } else {
                    $('#signup-error')
                        .removeClass('text-success')
                        .addClass('text-danger')
                        .text(data.message || 'Signup failed. Please try again.');
                }
            });
        });

        $('#modal-signin').on('shown.bs.modal', function () {
            $('#signin-error').text('');
        });
        $('#modal-signup').on('shown.bs.modal', function () {
            $('#signup-error').text('');
        });
    }

        //Main Page
        if($('#item-list').length) {
            callController({ command: 'CheckSession' }, function(data) {
                if (!data.loggedIn) {
                    window.location.href = "StartPage.html"; 
                    return;
              }       
            });
            function renderItems(items) {
                let itemList = $('#item-list');
                itemList.empty();
                if(!items || items.length === 0){
                    itemList.append('<p class="text-muted">No items found.</p>');
                    return;
                }
                items.forEach(function(it) {        
                    let badgeClass = '';
                    if (it.item_type === 'lost') {
                        badgeClass = 'bg-danger';
                    } 
                    else {
                        badgeClass = 'bg-success';
                    }

                let statusText = '';
                if (it.status === 'returned') {
                    statusText = ' (Returned)';
            }

                let markBtn = '';
                if (it.status === 'open') {
                    markBtn = '<button class="btn btn-sm btn-outline-secondary btn-mark-returned" ' +
                  'data-id="' + it.id + '">Mark as Returned</button>';
                }

                let postedBy = '';

                if (it.Name) {
                    postedBy = it.Name;
                } 
                else {
                    postedBy = '';
                }

                let card = `
                    <div class="card mb-3">
                    <div class="card-body">
                    <h5 class="card-title">
                        ${it.title}
                        <span class="badge ${badgeClass} ms-2 text-uppercase">${it.item_type}</span>
                        <span class="text-muted small">${statusText}</span>
                    </h5>

                    <p class="card-text mb-1">${it.description}</p>
                    <p class="card-text mb-1"><strong>Location:</strong> ${it.location}</p>
                    <p class="card-text mb-1"><strong>Posted by:</strong> ${postedBy}</p>

                    <div class="mt-2">
                    ${markBtn}
                    </div>
                    </div>
                    </div>
                `;
                itemList.append(card);
            });
        }

        // ITEMS 
        function loadItems(filterType) {
            $('#items-error').text('');
            callController({
                command: 'ListItems',
                Filter: filterType
            }, function (data) {
                if (data.success) {
                    renderItems(data.items);
                } else {
                    $('#items-error').text(data.message || 'Failed to load items.');
                }
            });
        }

        function loadMyItems() {
            $('#items-error').text('');
            callController({
                command: 'MyPosts'
            }, function (resp) {
                if (resp.success) {
                    renderItems(resp.items);
                } else {
                    $('#items-error').text(resp.message || 'Failed to load my items.');
                }
            });
        }

        //ABS (All / Lost / Found)
        $('#all-tab').on('click', function () {
            $('#all-tab, #lost-tab, #found-tab').removeClass('active');
            $(this).addClass('active');
            loadItems('all');
        });

        $('#lost-tab').on('click', function () {
            $('#all-tab, #lost-tab, #found-tab').removeClass('active');
            $(this).addClass('active');
            loadItems('lost');
        });

        $('#found-tab').on('click', function () {
            $('#all-tab, #lost-tab, #found-tab').removeClass('active');
            $(this).addClass('active');
            loadItems('found');
        });

        //SIDEBAR BUTTONS
        $('#myPost').on('click', function () {
            $('#items-error').text('');
            loadMyItems();
        });

        $('#postLost').on('click', function () {
            $('#itemName').val('');
            $('#itemDescription').val('');
            $('#itemLocation').val('');
            $('#lost-item-error').text('');
            let m = new bootstrap.Modal(document.getElementById('modal-lostPosts'));
            m.show();
        });

        $('#postFound').on('click', function () {
            $('#foundItemName').val('');
            $('#foundDescription').val('');
            $('#foundLocation').val('');
            $('#found-item-error').text('');
            let m = new bootstrap.Modal(document.getElementById('modal-foundPosts'));
            m.show();
        });

        //SEARCH 
        $('#search').on('submit', function (e) {
            e.preventDefault();
            let kw = $('#searchInput').val().trim();
            $('#items-error').text('');

            if (kw === '') {
                loadItems('all');
                return;
            }

            callController({
                command: 'SearchItems',
                Keyword: kw
            }, function (data) {
                if (data.success) {
                    renderItems(data.items);
                } else {
                    $('#items-error').text(data.message || 'Search failed.');
                }
            });
        });

        // SAVE LOST ITEM 
        $('#btn-save-lost').on('click', function () {
            let t = $('#itemName').val().trim();
            let d = $('#itemDescription').val().trim();
            let l = $('#itemLocation').val().trim();
            $('#lost-item-error').text('');

            if (t === '' || d === '' || l === '') {
                $('#lost-item-error').text('Please fill all fields.');
                return;
            }

            callController({
                command: 'PostItem',
                Title: t,
                Description: d,
                Location: l,
                Type: 'lost'
            }, function (data) {
                if (data.success) {
                    let m = bootstrap.Modal.getInstance(document.getElementById('modal-lostPosts'));
                    m.hide();
                    $('#lost-tab').click();
                } else {
                    $('#lost-item-error').text(data.message || 'Failed to post item.');
                }
            });
        });

        // SAVE FOUND ITEM 
        $('#btn-save-found').on('click', function () {
            let t = $('#foundItemName').val().trim();
            let d = $('#foundDescription').val().trim();
            let l = $('#foundLocation').val().trim();
            $('#found-item-error').text('');

            if (t === '' || d === '' || l === '') {
                $('#found-item-error').text('Please fill all fields.');
                return;
            }

            callController({
                command: 'PostItem',
                Title: t,
                Description: d,
                Location: l,
                Type: 'found'
            }, function (data) {
                if (data.success) {
                    let m = bootstrap.Modal.getInstance(document.getElementById('modal-foundPosts'));
                    m.hide();
                    $('#found-tab').click();
                } else {
                    $('#found-item-error').text(data.message || 'Failed to post item.');
                }
            });
        });

        // MARK AS RETURNED
        $('#item-list').on('click', '.btn-mark-returned', function () {
            let id = $(this).data('id');
            callController({
                command: 'MarkReturned',
                ItemId: id
            }, function (data) {
                if (data.success) {
                    loadMyItems();
                } else {
                    alert(data.message || 'Failed to mark item as returned.');
                }
            });
        });

        // PROFILE
        $('#profile').on('click', function () {
            $('#profile-error').text('');
            callController({
                command: 'GetProfile'
            }, function (data) {
                if (data.success && data.profile) {
                    let p = data.profile;
                    $('#profileName').val(p.Username || '');
                    $('#displayName').val(p.Name || '');
                    $('#profileEmail').val(p.Email || '');
                    $('#profilePhone').val(p["PhoneNo."] || p.PhoneNo || '');
                    $('#profileBio').val(p.Bio || '');
                    let m = new bootstrap.Modal(document.getElementById('modal-profile'));
                    m.show();
                } else {
                    alert(data.message || 'Failed to load profile.');
                }
            });
        });

        $('#btn-save-profile').on('click', function () {
            let name  = $('#displayName').val().trim();
            let email = $('#profileEmail').val().trim();
            let phone = $('#profilePhone').val().trim();
            $('#profile-error').text('');

            if (email === '') {
                $('#profile-error').text('Email is required.');
                return;
            }

            callController({
                command: 'UpdateProfile',
                Name: name,
                Email: email,
                Phone: phone
            }, function (data) {
                if (data.success) {
                    let m = bootstrap.Modal.getInstance(document.getElementById('modal-profile'));
                    m.hide();
                } 
                else {
                    $('#profile-error').text(data.message || 'Failed to save profile.');
                }
            });
        });

        //LOG OUT
        $('#logout').on('click', function () {
            callController({ command: 'SignOut' }, function () {
                window.location.href = 'StartPage.html';
            });
        });

        //  DELETE ACCOUNT
        $('#deleteAccount').on('click', function () {
            if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                return;
            }
            callController({ command: 'DeleteAccount' }, function (data) {
                if (data.success) {
                    window.location.href = 'StartPage.html';
                } 
                else {
                    alert(data.message || 'Failed to delete account.');
                }
            });
        });
    }
});
