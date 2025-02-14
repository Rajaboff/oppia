// Copyright 2019 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Tests for the Base Transclusion Component.
 */

import { DOCUMENT } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppConstants } from 'app.constants';
import { LimitToPipe } from 'filters/limit-to.pipe';
import { CookieModule, CookieService } from 'ngx-cookie';
import { Observable, of } from 'rxjs';
import { BottomNavbarStatusService } from 'services/bottom-navbar-status.service';
import { UrlService } from 'services/contextual/url.service';
import { WindowRef } from 'services/contextual/window-ref.service';
import { KeyboardShortcutService } from 'services/keyboard-shortcut.service';
import { LoaderService } from 'services/loader.service';
import { PageTitleService } from 'services/page-title.service';
import { SidebarStatusService } from 'services/sidebar-status.service';
import { BackgroundMaskService } from 'services/stateful/background-mask.service';
import { MockTranslatePipe } from 'tests/unit-test-utils';
import { BaseContentComponent } from './base-content.component';

describe('Base Content Component', () => {
  // This corresponds to Fri, 21 Nov 2014 09:45:00 GMT.
  const NOW_MILLIS = 1416563100000;
  const ONE_YEAR_FROM_NOW_MILLIS = 1448099100000;
  let fixture: ComponentFixture<BaseContentComponent>;
  let componentInstance: BaseContentComponent;
  let isIframed: boolean = false;
  let hostname: string = '';
  let href: string = 'test_href';
  let pathname: string = 'test_pathname';
  let search: string = 'test_search';
  let hash: string = 'test_hash';
  let backgroundMaskService: BackgroundMaskService;
  let bottomNavbarStatusService: BottomNavbarStatusService;
  let windowRef: WindowRef;
  let loaderService: LoaderService;
  let keyboardShortcutService: KeyboardShortcutService;
  let sidebarStatusService: SidebarStatusService;
  let cookieService: CookieService;
  let oldDate = Date;

  class MockUrlService {
    isIframed(): boolean {
      return isIframed;
    }
  }

  class MockWindowRef {
    nativeWindow = {
      location: {
        hostname: hostname,
        href: href,
        pathname: pathname,
        search: search,
        hash: hash
      },
      document: {
        addEventListener(event: string, callback: () => void) {
          callback();
        }
      }
    };
  }

  class MockLoaderService {
    onLoadingMessageChange: Observable<string> = of('Test Message');
  }

  class MockPageTitleService {
    getPageTitleForMobileView(): string {
      return 'Page Title';
    }

    getPageSubtitleForMobileView(): string {
      return 'Page Subtitle';
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CookieModule.forRoot()
      ],
      declarations: [
        BaseContentComponent,
        MockTranslatePipe,
        LimitToPipe
      ],
      providers: [
        {
          provide: WindowRef,
          useClass: MockWindowRef
        },
        {
          provide: UrlService,
          useClass: MockUrlService
        },
        BackgroundMaskService,
        BottomNavbarStatusService,
        KeyboardShortcutService,
        {
          provide: LoaderService,
          useClass: MockLoaderService
        },
        {
          provide: PageTitleService,
          useClass: MockPageTitleService
        },
        SidebarStatusService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseContentComponent);
    componentInstance = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    loaderService = (loaderService as unknown) as jasmine.SpyObj<LoaderService>;
    keyboardShortcutService = TestBed.inject(KeyboardShortcutService);
    keyboardShortcutService = (keyboardShortcutService as unknown) as
     jasmine.SpyObj<KeyboardShortcutService>;
    windowRef = TestBed.inject(WindowRef);
    windowRef = (windowRef as unknown) as jasmine.SpyObj<WindowRef>;
    sidebarStatusService = TestBed.inject(SidebarStatusService);
    sidebarStatusService = (sidebarStatusService as unknown) as
     jasmine.SpyObj<SidebarStatusService>;
    bottomNavbarStatusService = TestBed.inject(BottomNavbarStatusService);
    bottomNavbarStatusService = (bottomNavbarStatusService as unknown) as
     jasmine.SpyObj<BottomNavbarStatusService>;
    backgroundMaskService = TestBed.inject(BackgroundMaskService);
    backgroundMaskService = (backgroundMaskService as unknown) as
     jasmine.SpyObj<BackgroundMaskService>;
    cookieService = TestBed.inject(CookieService);
  });

  afterEach(() => {
    componentInstance.ngOnDestroy();
  });

  it('should create', () => {
    expect(componentInstance).toBeDefined();
  });

  it('should initiaize', () => {
    spyOn(keyboardShortcutService, 'bindNavigationShortcuts');
    windowRef.nativeWindow.location.hostname = 'oppiaserver.appspot.com';
    componentInstance.ngOnInit();
    expect(componentInstance.loadingMessage).toEqual('Test Message');
    expect(keyboardShortcutService.bindNavigationShortcuts).toHaveBeenCalled();
    expect(componentInstance.iframed).toEqual(isIframed);
    expect(componentInstance.getHeaderText()).toEqual('Page Title');
    expect(componentInstance.getSubheaderText()).toEqual('Page Subtitle');
    expect(componentInstance.getSubheaderText).toBeDefined();
    expect(windowRef.nativeWindow.location.href).toEqual(
      'https://oppiatestserver.appspot.com' +
       pathname + search + hash
    );
  });

  it('should get sidebar status', () => {
    spyOn(sidebarStatusService, 'isSidebarShown').and.returnValue(false);
    expect(componentInstance.isSidebarShown()).toBeFalse();
    expect(sidebarStatusService.isSidebarShown).toHaveBeenCalled();
  });

  it('should get bottom navbar status', () => {
    spyOn(bottomNavbarStatusService, 'isBottomNavbarEnabled')
      .and.returnValue(false);
    expect(componentInstance.isBottomNavbarShown()).toBeFalse();
    expect(bottomNavbarStatusService.isBottomNavbarEnabled).toHaveBeenCalled();
  });

  it('should close sidebar on swipe', () => {
    spyOn(sidebarStatusService, 'closeSidebar');
    componentInstance.closeSidebarOnSwipe();
    expect(sidebarStatusService.closeSidebar).toHaveBeenCalled();
  });

  it('should toggle mobile nav options', () => {
    componentInstance.mobileNavOptionsAreShown = false;
    componentInstance.toggleMobileNavOptions();
    expect(componentInstance.mobileNavOptionsAreShown).toBeTrue();
  });

  it('should get background mask status', () => {
    spyOn(backgroundMaskService, 'isMaskActive').and.returnValue(false);
    expect(componentInstance.isBackgroundMaskActive()).toBeFalse();
    expect(backgroundMaskService.isMaskActive).toHaveBeenCalled();
  });

  it('should skip to main content', () => {
    let document = TestBed.inject(DOCUMENT);
    let dummyElement = document.createElement('div');
    spyOn(document, 'getElementById').and.returnValue(dummyElement);
    componentInstance.skipToMainContent();
    expect(dummyElement.tabIndex).toEqual(-1);
  });

  it('should throw error when there is no main content', () => {
    let document = TestBed.inject(DOCUMENT);
    spyOn(document, 'getElementById').and.returnValue(null);
    expect(componentInstance.skipToMainContent).toThrowError(
      'Variable mainContentElement is null.');
  });

  it('should show the cookie banner if there is no cookie set', () => {
    spyOn(cookieService, 'get').and.returnValue('');
    expect(componentInstance.hasAcknowledgedCookies()).toBeFalse();
  });

  it('should show the cookie banner if a cookie exists but the policy has ' +
     'been updated', () => {
    spyOn(cookieService, 'get').and.returnValue(
      String(AppConstants.COOKIE_POLICY_LAST_UPDATED_MSECS - 100000));
    expect(componentInstance.hasAcknowledgedCookies()).toBeFalse();
  });

  it('should not show the cookie banner if a valid cookie exists', () => {
    spyOn(cookieService, 'get').and.returnValue(
      String(AppConstants.COOKIE_POLICY_LAST_UPDATED_MSECS + 100000));
    expect(componentInstance.hasAcknowledgedCookies()).toBeTrue();
  });

  it('should be able to acknowledge cookies', () => {
    spyOn(window, 'Date')
      // This throws "Argument of type 'Date' is not assignable to parameter of
      // type 'string'.". We need to suppress this error because DateConstructor
      // cannot be mocked without it.
      // @ts-expect-error
      .withArgs().and.returnValue(new oldDate(NOW_MILLIS))
      // This throws "Expected 0 arguments, but got 1.". We need to suppress
      // this error because we pass an argument to the Date constructor in the
      // component code.
      // @ts-expect-error
      .withArgs(ONE_YEAR_FROM_NOW_MILLIS).and.callThrough();
    spyOn(cookieService, 'put');
    componentInstance.acknowledgeCookies();
    expect(cookieService.put).toHaveBeenCalledWith(
      'OPPIA_COOKIES_ACKNOWLEDGED', String(NOW_MILLIS),
      {
        expires: new oldDate(ONE_YEAR_FROM_NOW_MILLIS),
        secure: true,
        sameSite: 'none'
      });
  });
});
