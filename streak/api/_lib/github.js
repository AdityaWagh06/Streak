import { Octokit } from '@octokit/rest';

export const TARGET_REPO = 'daily-streak-log';

export const DEFAULT_HABITS = [
  { id: 'workout', name: 'Physical Conditioning [Push-ups & Gym]', emoji: '🏋️', attribute: 'STR' },
  { id: 'coding', name: 'Arcane Algorithms [LeetCode / DSA]', emoji: '🧠', attribute: 'INT' },
  { id: 'reading', name: 'Grimoire Study [Deep Reading]', emoji: '📖', attribute: 'INT' },
  { id: 'hydration', name: 'Mana Recovery [Hydration & Sleep]', emoji: '💧', attribute: 'VIT' },
  { id: 'building', name: 'Artifact Crafting [Shipped Something]', emoji: '⚔️', attribute: 'AGI' }
];

export const DEFAULT_README = `# Daily Quest Log — Solo Leveling System

A running log of daily quests committed automatically from my phone via my Solo Leveling System PWA. Every commit represents genuine quests cleared that day.

- **Quests Configuration**: \`habits.json\`
- **Dungeon / Raid Logs**: \`data/\`
`;

/**
 * Instantiate Octokit with the user's OAuth access token
 */
export function getOctokit(accessToken) {
  return new Octokit({
    auth: accessToken,
    userAgent: 'Streak-SoloLeveling-v2',
  });
}

/**
 * Fetch file from GitHub repo. Returns decoded content & sha.
 */
export async function getRepoFile(octokit, owner, repo, path) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data) || !data.content) {
      return { exists: false, content: null, sha: null };
    }

    const decoded = Buffer.from(data.content, 'base64').toString('utf8');
    return {
      exists: true,
      content: decoded,
      sha: data.sha,
    };
  } catch (err) {
    if (err.status === 404) {
      return { exists: false, content: null, sha: null };
    }
    throw err;
  }
}

/**
 * Commit a file to GitHub repo.
 */
export async function commitRepoFile(octokit, owner, repo, path, message, contentString, sha = null) {
  const contentBase64 = Buffer.from(contentString, 'utf8').toString('base64');
  
  const params = {
    owner,
    repo,
    path,
    message,
    content: contentBase64,
  };

  if (sha) {
    params.sha = sha;
  }

  const { data } = await octokit.rest.repos.createOrUpdateFileContents(params);
  return data;
}

/**
 * First-login bootstrap:
 * 1. Checks if {owner}/daily-streak-log exists.
 * 2. If 404, creates public repo with auto_init: true.
 * 3. Overwrites README.md with clean documentation.
 * 4. Creates habits.json with starter set.
 */
export async function bootstrapRepo(octokit, username) {
  try {
    await octokit.rest.repos.get({
      owner: username,
      repo: TARGET_REPO,
    });
    return { created: false, repo: TARGET_REPO };
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
  }

  console.log(`Bootstrapping new repository ${username}/${TARGET_REPO}...`);
  await octokit.rest.repos.createForAuthenticatedUser({
    name: TARGET_REPO,
    description: 'Solo Leveling Daily Quest Log — every commit is a genuine quest cleared.',
    private: false,
    auto_init: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  let readmeSha = null;
  try {
    const readmeFile = await getRepoFile(octokit, username, TARGET_REPO, 'README.md');
    if (readmeFile.exists) {
      readmeSha = readmeFile.sha;
    }
  } catch (e) {}

  await commitRepoFile(
    octokit,
    username,
    TARGET_REPO,
    'README.md',
    'Initialize Solo Leveling Daily Quest System documentation',
    DEFAULT_README,
    readmeSha
  );

  const habitsJsonStr = JSON.stringify(DEFAULT_HABITS, null, 2);
  await commitRepoFile(
    octokit,
    username,
    TARGET_REPO,
    'habits.json',
    'Initialize Solo Leveling daily quest configuration',
    habitsJsonStr
  );

  console.log(`Successfully bootstrapped ${username}/${TARGET_REPO}`);
  return { created: true, repo: TARGET_REPO };
}
