// GCode Skill Hub - Main JavaScript

const API_BASE = 'https://skills-api.bytarch.dpdns.org';

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        showToast('Copied to clipboard!');
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        showToast('Failed to copy', 'error');
        console.error('Copy failed:', err);
    });
}

// API Functions
async function fetchAllSkills() {
    try {
        const response = await fetch(`${API_BASE}/skills`);
        if (!response.ok) throw new Error('Failed to fetch skills');
        return await response.json();
    } catch (error) {
        console.error('Error fetching skills:', error);
        return [];
    }
}

async function fetchTrendingSkills() {
    try {
        const response = await fetch(`${API_BASE}/skills/trending`);
        if (!response.ok) throw new Error('Failed to fetch trending skills');
        return await response.json();
    } catch (error) {
        console.error('Error fetching trending skills:', error);
        return { skills: [] };
    }
}

async function fetchHotSkills() {
    try {
        const response = await fetch(`${API_BASE}/skills/hot`);
        if (!response.ok) throw new Error('Failed to fetch hot skills');
        return await response.json();
    } catch (error) {
        console.error('Error fetching hot skills:', error);
        return { skills: [] };
    }
}

async function searchSkills(query) {
    try {
        const response = await fetch(`${API_BASE}/skills/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('Error searching skills:', error);
        return { results: [] };
    }
}

async function fetchUserSkills(username) {
    try {
        const response = await fetch(`${API_BASE}/user/${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error('Failed to fetch user skills');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user skills:', error);
        return null;
    }
}

async function fetchSkillDefinition(username, repo, skillName) {
    try {
        const response = await fetch(`${API_BASE}/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/${encodeURIComponent(skillName)}`);
        if (!response.ok) throw new Error('Failed to fetch skill definition');
        return await response.json();
    } catch (error) {
        console.error('Error fetching skill definition:', error);
        return null;
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/skills/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

// UI Functions
function createSkillCard(skill, showSourceUrl = false) {
    const sourceUrl = skill.skillSourceUrl || "Not Available";
    
    return `
        <div class="skill-card bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 cursor-pointer" onclick="navigateToSkill('${skill.repository}', '${skill.name}')">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-white">${skill.name}</h3>
                    <p class="text-sm text-gray-400 mt-1">${skill.repository}</p>
                </div>
                <span class="badge badge-blue">#${skill.rank}</span>
            </div>
            <div class="flex items-center justify-between mt-4">
                <span class="text-sm text-gray-400">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    ${skill.installCount || 'N/A'}
                </span>
                <button class="copy-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2" onclick="event.stopPropagation(); copyToClipboard('${sourceUrl}', this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                    Copy Install
                </button>
            </div>
            ${showSourceUrl ? `
                <div class="mt-4 p-3 bg-gray-900 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">Source URL:</p>
                    <p class="text-sm text-gray-300 font-mono break-all">${sourceUrl}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function createUserCard(userData) {
    return `
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    ${userData.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-white">${userData.user.username}</h3>
                    <p class="text-gray-400">${userData.user.repoCount} repositories</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-6">
                <div class="text-center">
                    <p class="text-2xl font-bold text-white">${formatNumber(userData.user.totalInstalls)}</p>
                    <p class="text-xs text-gray-400">Total Installs</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-white">${userData.user.skillsCount}</p>
                    <p class="text-xs text-gray-400">Skills</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-white">${userData.user.repoCount}</p>
                    <p class="text-xs text-gray-400">Repos</p>
                </div>
            </div>
        </div>
    `;
}

function navigateToSkill(repository, skillName) {
    const [username, repo] = repository.split('/');
    window.location.href = `/pages/skill-detail.html?repo=${encodeURIComponent(repository)}&name=${encodeURIComponent(skillName)}`;
}

// Search functionality
async function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) return;
    
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }
            
            const results = await searchSkills(query);
            if (results.results && results.results.length > 0) {
                searchResults.innerHTML = results.results.slice(0, 10).map(skill => `
                    <div class="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0" onclick="navigateToSkill('${skill.repository}', '${skill.name}')">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-white font-medium">${skill.name}</p>
                                <p class="text-xs text-gray-400">${skill.repository}</p>
                            </div>
                            <span class="text-xs text-gray-500">#${skill.rank}</span>
                        </div>
                    </div>
                `).join('');
                searchResults.classList.remove('hidden');
            } else {
                searchResults.innerHTML = '<div class="p-3 text-gray-400 text-center">No results found</div>';
                searchResults.classList.remove('hidden');
            }
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

// Initialize featured skills on homepage
async function initFeaturedSkills() {
    const container = document.getElementById('featuredSkills');
    if (!container) return;
    
    const skills = await fetchAllSkills();
    const featured = skills.slice(0, 8);
    
    container.innerHTML = featured.map(skill => createSkillCard(skill)).join('');
}

// Initialize stats on homepage
async function initStats() {
    const container = document.getElementById('statsContainer');
    if (!container) return;
    
    const stats = await fetchStats();
    if (stats) {
        container.innerHTML = `
            <div class="stats-card p-4 bg-gray-800 rounded-lg text-center">
                <p class="text-3xl font-bold text-white">${stats.totalSkills || 0}</p>
                <p class="text-sm text-gray-400">Total Skills</p>
            </div>
            <div class="stats-card p-4 bg-gray-800 rounded-lg text-center">
                <p class="text-3xl font-bold text-white">${stats.pagesScraped || 0}</p>
                <p class="text-sm text-gray-400">Pages Scraped</p>
            </div>
            <div class="stats-card p-4 bg-gray-800 rounded-lg text-center">
                <p class="text-3xl font-bold text-white">${stats.pages ? stats.pages.length : 0}</p>
                <p class="text-sm text-gray-400">Categories</p>
            </div>
        `;
    }
}

// Initialize skills page
async function initSkillsPage() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
    
    const skills = await fetchAllSkills();
    
    if (skills.length > 0) {
        container.innerHTML = skills.map(skill => createSkillCard(skill, false)).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p class="empty-state-title">No skills found</p>
                <p class="empty-state-description">Unable to load skills at this time. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize trending page
async function initTrendingPage() {
    const container = document.getElementById('trendingContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
    
    const data = await fetchTrendingSkills();
    
    if (data.skills && data.skills.length > 0) {
        container.innerHTML = data.skills.map(skill => createSkillCard(skill, true)).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📈</div>
                <p class="empty-state-title">No trending skills</p>
                <p class="empty-state-description">Unable to load trending skills at this time.</p>
            </div>
        `;
    }
}

// Initialize hot page
async function initHotPage() {
    const container = document.getElementById('hotContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
    
    const data = await fetchHotSkills();
    
    if (data.skills && data.skills.length > 0) {
        container.innerHTML = data.skills.map(skill => createSkillCard(skill, true)).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔥</div>
                <p class="empty-state-title">No hot skills</p>
                <p class="empty-state-description">Unable to load hot skills at this time.</p>
            </div>
        `;
    }
}

// Initialize skill detail page
async function initSkillDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const repo = params.get('repo');
    const name = params.get('name');
    
    if (!repo || !name) {
        window.location.href = 'skills.html';
        return;
    }
    
    const [username, repoName] = repo.split('/');
    const container = document.getElementById('skillDetailContainer');
    
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
    
    const skillData = await fetchSkillDefinition(username, repoName, name);
    
    if (skillData && skillData.skill) {
        const skill = skillData.skill;
        const sourceUrl = skillData.skillSourceUrl || "Not Available";
        
        container.innerHTML = `
            <div class="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <div class="flex items-start justify-between mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-white mb-2">${skill.name}</h1>
                        <p class="text-gray-400">${skill.repository}</p>
                    </div>
                    <span class="badge badge-green">Available</span>
                </div>
                
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-3">Install Command</h2>
                    <div class="bg-gray-900 rounded-lg p-4 relative">
                        <pre class="text-gray-300 font-mono text-sm overflow-x-auto"><code>${sourceUrl}</code></pre>
                        <button class="copy-btn absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2" onclick="copyToClipboard('${sourceUrl}', this)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                            </svg>
                            Copy
                        </button>
                    </div>
                </div>
                
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-3">Description</h2>
                    <p class="text-gray-300">${skill.definition || 'No description available.'}</p>
                </div>
                
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-3">Statistics</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <p class="text-2xl font-bold text-white">${skill.installCount || 'N/A'}</p>
                            <p class="text-sm text-gray-400">Installs</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <p class="text-2xl font-bold text-white">#${skill.rank || 'N/A'}</p>
                            <p class="text-sm text-gray-400">Rank</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <p class="text-2xl font-bold text-white">${skill.repository}</p>
                            <p class="text-sm text-gray-400">Repository</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <a href="${skill.githubUrl || '#'}" target="_blank" class="text-blue-400 hover:text-blue-300">View on GitHub →</a>
                        </div>
                    </div>
                </div>
                
                ${skill.skillsTree && skill.skillsTree.length > 0 ? `
                    <div>
                        <h2 class="text-xl font-semibold text-white mb-3">Skills Tree</h2>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <ul class="space-y-2">
                                ${skill.skillsTree.map(item => `
                                    <li class="flex items-center gap-2 text-gray-300">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        ${item.path}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <p class="empty-state-title">Skill not found</p>
                <p class="empty-state-description">Unable to load skill details. Please check the URL and try again.</p>
                <a href="skills.html" class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Browse Skills</a>
            </div>
        `;
    }
}

// Initialize user page
async function initUserPage() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    
    if (!username) {
        window.location.href = 'skills.html';
        return;
    }
    
    const container = document.getElementById('userContainer');
    const skillsContainer = document.getElementById('userSkillsContainer');
    
    if (!container || !skillsContainer) return;
    
    container.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
    
    const userData = await fetchUserSkills(username);
    
    if (userData) {
        container.innerHTML = createUserCard(userData);
        
        if (userData.skills && userData.skills.length > 0) {
            skillsContainer.innerHTML = userData.skills.map(skill => createSkillCard(skill, true)).join('');
        } else {
            skillsContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No skills found for this user.</p>';
        }
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <p class="empty-state-title">User not found</p>
                <p class="empty-state-description">Unable to find user "${username}". Please check the username and try again.</p>
                <a href="skills.html" class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Browse Skills</a>
            </div>
        `;
    }
}

// Page detection and initialization
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('skills.html')) {
        initSkillsPage();
    } else if (path.includes('trending.html')) {
        initTrendingPage();
    } else if (path.includes('hot.html')) {
        initHotPage();
    } else if (path.includes('skill-detail.html')) {
        initSkillDetailPage();
    } else if (path.includes('user.html')) {
        initUserPage();
    } else {
        initFeaturedSkills();
        initStats();
    }
    
    initSearch();
});