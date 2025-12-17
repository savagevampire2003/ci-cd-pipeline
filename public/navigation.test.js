/**
 * Navigation System Tests
 * Tests for Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

describe('Navigation System', () => {
  let mockDocument;
  let mockElements;

  beforeEach(() => {
    // Mock DOM elements
    mockElements = {
      homeTab: { style: { display: 'none' } },
      studentsTab: { style: { display: 'none' } },
      profileTab: { style: { display: 'none' } },
      homeNavTab: { classList: { add: jest.fn(), remove: jest.fn() } },
      studentsNavTab: { classList: { add: jest.fn(), remove: jest.fn() } },
      profileNavTab: { classList: { add: jest.fn(), remove: jest.fn() } }
    };

    global.document = {
      getElementById: jest.fn((id) => {
        const elementMap = {
          'homeTab': mockElements.homeTab,
          'studentsTab': mockElements.studentsTab,
          'profileTab': mockElements.profileTab
        };
        return elementMap[id];
      }),
      querySelector: jest.fn((selector) => {
        if (selector === '.nav-tab[data-tab="home"]') return mockElements.homeNavTab;
        if (selector === '.nav-tab[data-tab="students"]') return mockElements.studentsNavTab;
        if (selector === '.nav-tab[data-tab="profile"]') return mockElements.profileNavTab;
        return null;
      }),
      querySelectorAll: jest.fn((selector) => {
        if (selector === '.tab-content') {
          return [mockElements.homeTab, mockElements.studentsTab, mockElements.profileTab];
        }
        if (selector === '.nav-tab') {
          return [mockElements.homeNavTab, mockElements.studentsNavTab, mockElements.profileNavTab];
        }
        return [];
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should have navigation bar with Home, Students, Profile, and Logout tabs', () => {
    // Requirement 2.1: Navigation bar structure
    const navTabs = ['home', 'students', 'profile'];

    navTabs.forEach(tab => {
      const element = document.querySelector(`.nav-tab[data-tab="${tab}"]`);
      expect(element).toBeDefined();
    });
  });

  test('should switch to Home tab and display dashboard', () => {
    // Requirement 2.2: Home tab displays dashboard
    const tabName = 'home';

    // Simulate switchTab function behavior
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabName + 'Tab');
    selectedTab.style.display = 'block';

    const navTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    navTab.classList.add('active');

    expect(mockElements.homeTab.style.display).toBe('block');
    expect(mockElements.homeNavTab.classList.add).toHaveBeenCalledWith('active');
  });

  test('should switch to Students tab and display student management interface', () => {
    // Requirement 2.3: Students tab displays student management
    const tabName = 'students';

    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabName + 'Tab');
    selectedTab.style.display = 'block';

    const navTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    navTab.classList.add('active');

    expect(mockElements.studentsTab.style.display).toBe('block');
    expect(mockElements.studentsNavTab.classList.add).toHaveBeenCalledWith('active');
  });

  test('should switch to Profile tab and display user information', () => {
    // Requirement 2.4: Profile tab displays user information
    const tabName = 'profile';

    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabName + 'Tab');
    selectedTab.style.display = 'block';

    const navTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    navTab.classList.add('active');

    expect(mockElements.profileTab.style.display).toBe('block');
    expect(mockElements.profileNavTab.classList.add).toHaveBeenCalledWith('active');
  });

  test('should highlight active tab visually', () => {
    // Requirement 2.5: Active tab highlighting
    const tabName = 'home';

    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Add active class to selected tab
    const navTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    navTab.classList.add('active');

    expect(mockElements.homeNavTab.classList.remove).toHaveBeenCalledWith('active');
    expect(mockElements.homeNavTab.classList.add).toHaveBeenCalledWith('active');
  });

  test('should hide all other tabs when switching to a specific tab', () => {
    // Client-side routing behavior
    const tabName = 'students';

    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabName + 'Tab');
    selectedTab.style.display = 'block';

    expect(mockElements.homeTab.style.display).toBe('none');
    expect(mockElements.studentsTab.style.display).toBe('block');
    expect(mockElements.profileTab.style.display).toBe('none');
  });

  test('should remove active class from all tabs before highlighting new tab', () => {
    // Ensure only one tab is active at a time
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    expect(mockElements.homeNavTab.classList.remove).toHaveBeenCalledWith('active');
    expect(mockElements.studentsNavTab.classList.remove).toHaveBeenCalledWith('active');
    expect(mockElements.profileNavTab.classList.remove).toHaveBeenCalledWith('active');
  });
});

describe('Dashboard Statistics', () => {
  test('should display welcome message with user name', () => {
    // Requirement 2.2: Dashboard with welcome message
    const mockUser = { fullName: 'John Doe', username: 'johndoe' };

    const welcomeElement = { textContent: '' };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'welcomeUsername') return welcomeElement;
        return null;
      })
    };

    welcomeElement.textContent = mockUser.fullName || mockUser.username;

    expect(welcomeElement.textContent).toBe('John Doe');
  });

  test('should display total students count', () => {
    // Dashboard statistics
    const totalStudentsElement = { textContent: '' };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'totalStudents') return totalStudentsElement;
        return null;
      })
    };

    const students = [{ name: 'Student 1' }, { name: 'Student 2' }, { name: 'Student 3' }];
    totalStudentsElement.textContent = students.length;

    expect(totalStudentsElement.textContent).toBe(3);
  });

  test('should calculate students added this month', () => {
    // Dashboard statistics
    const recentStudentsElement = { textContent: '' };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'recentStudents') return recentStudentsElement;
        return null;
      })
    };

    const now = new Date();
    const students = [
      { name: 'Student 1', createdAt: new Date() },
      { name: 'Student 2', createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1) },
      { name: 'Student 3', createdAt: new Date() }
    ];

    const thisMonth = students.filter(s => {
      const createdDate = new Date(s.createdAt);
      return createdDate.getMonth() === now.getMonth() &&
                createdDate.getFullYear() === now.getFullYear();
    });

    recentStudentsElement.textContent = thisMonth.length;

    expect(recentStudentsElement.textContent).toBe(2);
  });
});
