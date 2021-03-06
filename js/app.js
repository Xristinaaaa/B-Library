'use strict';

import 'jquery';
import Sammy from 'sammy';
import { appUrls } from 'application-urls';
import { kinveyUrls } from 'kinvey-urls';
import { request } from 'requester';
import { header } from 'header-generator';
import { template } from 'template-generator';
import { pageLoader } from 'page-controller';
import { eventLoader } from 'event-controller';

let app = new Sammy(function() {

    this.get(appUrls.MAIN_URL, function() {
        if (localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.HOME_URL);
            return;
        }

        template.get('front-navigation')
            .then((temp) => pageLoader.loadFrontNavigation(temp));

        template.get('front-page')
            .then((temp) => pageLoader.loadPage(temp))
            .then(() => eventLoader.loadFrontPageEvents());
    });

    this.get(appUrls.HOME_URL, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        let top5 = {};

        template.get('user-navigation')
            .then((temp) => pageLoader.loadUserNavigation(temp))
            .then(() => eventLoader.loadUserNavigationEvents());

        let head = header.getHeader(true, false);
        request.get(`${kinveyUrls.KINVEY_BOOKS_URL}/?query={}&limit=5&sort={"countRead": -1, "rating": -1}`, head)
            .then((books) => { top5.books = books })
            .then(() => { return request.get(`${kinveyUrls.KINVEY_AUTHORS_URL}/?query={}&limit=5&sort={"amountOfFavorites": -1}`, head) })
            .then((auth) => { top5.authors = auth })
            .then(() => { return template.get('home-page') })
            .then(temp => pageLoader.loadPage(temp, top5))
            .then(() => { return template.get('book-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('book-read-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('author-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => eventLoader.loadHomePageEvents(top5))
            .then((data) => eventLoader.loadModalEvents(data))
            .then((data) => eventLoader.loadBooksButtonEvent(data))
            .then((data) => eventLoader.loadAuthorButtonEvent(data));
    });

    this.get(appUrls.AUTHORS_URL, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }

        let data = {};
        let head = header.getHeader(true, false);

        request.get(`${kinveyUrls.KINVEY_AUTHORS_URL}`, head)
            .then((auth) => {
                data.authors = auth;
                data.firstAuthors = auth.slice(0, 4);
                data.totalAuthorPages = auth.length / 4;
            })
            .then(() => { return template.get('authors-page') })
            .then((temp) => pageLoader.loadPage(temp, data))
            .then(() => { return template.get('author-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => eventLoader.loadAuthorsPageEvents(data))
            .then((data) => eventLoader.loadAuthorButtonEvent(data))
            .then((data) => eventLoader.loadModalEvents(data));
    });

    this.get(`${appUrls.AUTHORS_URL}/:id`, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }

        let head = header.getHeader(true, false);
        let data = {
            'authors': [],
        };

        request.get(`${kinveyUrls.KINVEY_AUTHORS_URL}/${this.params.id}?resolve_depth=3&retainReferences=false`, head)
            .then((author) => {
                data.authors.push(author);
                data.books = author.listOfBooks.books;
                data.firstBooks = author.listOfBooks.books.slice(0, 4);
                data.totalBookPages = author.listOfBooks.books.length / 4;
            })
            .then(() => { return template.get('author-single-page') })
            .then((temp) => pageLoader.loadPage(temp, data))
            .then(() => { return template.get('author-single-page-books') })
            .then((temp) => pageLoader.loadAuthorBooksPage(temp, data))
            .then(() => { return template.get('book-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('book-read-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => eventLoader.loadAuthorButtonEvent(data))
            .then(() => eventLoader.loadModalEvents(data))
            .then(() => eventLoader.loadBooksButtonEvent(data))
            .then(() => eventLoader.loadBooksPageEvents(data))
            .catch(() => this.redirect(appUrls.AUTHOR_ERROR_URL));
    });

    this.get(appUrls.BOOKS_URL, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }

        let data = {};
        let head = header.getHeader(true, false);

        request.get(`${kinveyUrls.KINVEY_BOOKS_URL}`, head)
            .then((books) => {
                data.books = books;
                data.firstBooks = books.slice(0, 8);
                data.totalBookPages = books.length / 8;
            })
            .then(() => { return template.get('books-page') })
            .then((temp) => pageLoader.loadPage(temp, data))
            .then(() => { return template.get('book-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('book-read-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => eventLoader.loadBooksPageEvents(data))
            .then((data) => eventLoader.loadModalEvents(data))
            .then((data) => eventLoader.loadBooksButtonEvent(data));
    });

    this.get(`${appUrls.BOOKS_URL}/:id`, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }

        let head = header.getHeader(true, false);
        let data = {
            'books': [],
        };

        request.get(`${kinveyUrls.KINVEY_BOOKS_URL}/${this.params.id}`, head)
            .then((book) => { data.books.push(book); })
            .then(() => { return template.get('book-single-page'); })
            .then((temp) => pageLoader.loadPage(temp, data))
            .then(() => { return template.get('book-read-modal'); })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => eventLoader.loadModalEvents(data))
            .then(() => eventLoader.loadBooksButtonEvent(data))
            .catch(() => this.redirect(appUrls.BOOK_ERROR_URL));
    });

    this.get(appUrls.COMMUNITY_URL, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }

        let data = {};
        let head = header.getHeader(true, false);

        request.get(`${kinveyUrls.KINVEY_USER_URL}/?resolve_depth=3&retainReferences=false`, head)
            .then((users) => {
                data.users = users;
                data.users.sort((a, b) => a.username < b.username);
                data.firstUsers = data.users.slice(0, 8);
                data.totalUserPages = data.users.length / 8;
            })
            .then(() => { return template.get('community-page'); })
            .then((temp) => {
                pageLoader.loadPage(temp, data);
            })
            .then(() => eventLoader.loadUserPageEvents(data));

    });

    this.get(`${appUrls.COMMUNITY_URL}/:username`, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if (this.params.username === localStorage.USER_NAME) {
            this.redirect(appUrls.PROFILE_URL);
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }

        let userdata;
        let head = header.getHeader(true, false);
        request.get(`${kinveyUrls.KINVEY_USER_URL}/?pattern=${this.params.username}&resolve_depth=5&retainReferences=false`, head)
            .then((user) => {
                console.log(user);
                userdata = user[0];
                userdata.firstAuthors = userdata.favoriteAuthors.slice(0, 4);
                userdata.firstBooks = userdata.readBooks.slice(0, 4);
                userdata.totalBookPages = userdata.readBooks.length / 4;
                userdata.totalAuthorsPages = userdata.favoriteAuthors.length / 4;
            })
            .then(() => { return template.get('profile-page') })
            .then((temp) => pageLoader.loadPage(temp, userdata))
            .then(() => { return template.get('book-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('book-review-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('author-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('select-avatar-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('book-read-modal'); })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => eventLoader.loadProfilePageEvents(userdata))
            .catch(() => this.redirect(appUrls.USER_ERROR_URL));
    });

    this.get(appUrls.PROFILE_URL, function() {
        if (!localStorage.AUTH_TOKEN) {
            this.redirect(appUrls.MAIN_URL);
            return;
        }

        if ($('nav').html() === '') {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        }



        let username = localStorage.getItem('USER_NAME')
        let userdata;
        let avatars;
        let head = header.getHeader(true, false);
        request.get(`${kinveyUrls.KINVEY_USER_URL}/?pattern=${username}&resolve_depth=5&retainReferences=false`, head)
            .then((user) => {
                userdata = user[0];
                if (userdata.username === localStorage.USER_NAME) {
                    userdata.ownprofile = true;
                }
                userdata.firstAuthors = userdata.favoriteAuthors.slice(0, 4);
                userdata.firstBooks = userdata.readBooks.slice(0, 4);
                userdata.totalBookPages = userdata.readBooks.length / 4;
                userdata.totalAuthorsPages = userdata.favoriteAuthors.length / 4;
            })
            .then(() => { return template.get('profile-page') })
            .then((temp) => pageLoader.loadPage(temp, userdata))
            .then(() => { return template.get('book-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('book-review-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return template.get('author-info-modal') })
            .then((temp) => pageLoader.loadModal(temp))
            .then(() => { return request.get(`${kinveyUrls.KINVEY_APPDATA_URL}/avatars`, head); })
            .then((av) => {
                avatars = av;
            })
            .then(() => { return template.get('select-avatar-modal') })
            .then((temp) => pageLoader.loadModal(temp, avatars))
            .then(() => eventLoader.loadProfilePageEvents(userdata));
    });

    this.get(appUrls.PAGE_NOT_FOUND_URL, function() {
        if (localStorage.AUTH_TOKEN) {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        } else {
            template.get('front-navigation')
                .then((temp) => pageLoader.loadFrontNavigation(temp))
                .then(() => eventLoader.loadFrontPageEvents());
        }

        let image = '../../assets/images/error-page.jpg';

        template.get('error-page')
            .then((temp) => pageLoader.loadPage(temp, image));
    });

    this.get(appUrls.AUTHOR_ERROR_URL, function() {
        if (localStorage.AUTH_TOKEN) {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        } else {
            template.get('front-navigation')
                .then((temp) => pageLoader.loadFrontNavigation(temp))
                .then(() => eventLoader.loadFrontPageEvents());
        }

        let image = '../../assets/images/error-author-page.jpg';

        template.get('error-page')
            .then((temp) => pageLoader.loadPage(temp, image));
    });

    this.get(appUrls.BOOK_ERROR_URL, function() {
        if (localStorage.AUTH_TOKEN) {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        } else {
            template.get('front-navigation')
                .then((temp) => pageLoader.loadFrontNavigation(temp))
                .then(() => eventLoader.loadFrontPageEvents());
        }

        let image = '../../assets/images/error-book-page.jpg';

        template.get('error-page')
            .then((temp) => pageLoader.loadPage(temp, image));
    });

    this.get(appUrls.USER_ERROR_URL, function() {
        if (localStorage.AUTH_TOKEN) {
            template.get('user-navigation')
                .then((temp) => pageLoader.loadUserNavigation(temp))
                .then(() => eventLoader.loadUserNavigationEvents());
        } else {
            template.get('front-navigation')
                .then((temp) => pageLoader.loadFrontNavigation(temp))
                .then(() => eventLoader.loadFrontPageEvents());
        }

        let image = '../../assets/images/error-person-page.jpg';

        template.get('error-page')
            .then((temp) => pageLoader.loadPage(temp, image));
    });

    this.get(/.*/, function() {
        this.redirect(appUrls.PAGE_NOT_FOUND_URL);
    });

    this.bind('redirectToUrl', function(event, url) {
        this.redirect(url);
    });

});

app.run(appUrls.MAIN_URL);
