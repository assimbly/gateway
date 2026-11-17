/**
 * The most common errors of a Flow, from the runtime's Camel and Java messages, said in plain words with what to do
 * about them. The raw message stays shown next to it, for whoever needs the details.
 */
export interface ErrorExplanation {
  /** What went wrong, in the words of the Gateway. */
  meaning: string;
  /** What the user can do about it. */
  fix: string;
}

interface Rule {
  pattern: RegExp;
  explain: (match: RegExpMatchArray) => ErrorExplanation;
}

const RULES: Rule[] = [
  {
    pattern: /Multiple consumers for the same endpoint/i,
    explain: () => ({
      meaning: 'Another running Flow already reads from this endpoint, and only one Flow at a time can.',
      fix: 'Stop the other Flow on Flows → Manage, or give this Flow a folder or queue of its own.',
    }),
  },
  {
    pattern: /Address already in use|BindException|Failed to bind/i,
    explain: () => ({
      meaning: 'Another Flow or program already listens on this port.',
      fix: 'Stop it, or use another port.',
    }),
  },
  {
    pattern: /PKIX path building failed|unable to find valid certification path|trustAnchors parameter must be non-empty/i,
    explain: () => ({
      meaning: "The Gateway doesn't trust the certificate of the server.",
      fix: 'Add it under Administration → Certificates, with Add → Download certificate.',
    }),
  },
  {
    pattern: /UnknownHostException|Name or service not known|No such host is known/i,
    explain: () => ({
      meaning: "The host in the address can't be found.",
      fix: 'Check the spelling of the address, and that the Gateway can reach the network or the internet.',
    }),
  },
  {
    pattern: /Connection refused|Connect to \S+( \[[^\]]*\])? failed|ConnectException/i,
    explain: () => ({
      meaning: 'Nothing answered at this address.',
      fix: 'Check the host and the port, and that the server or broker runs. A free online service may just be busy: try again.',
    }),
  },
  {
    pattern: /Read timed out|SocketTimeoutException|connect timed out/i,
    explain: () => ({
      meaning: 'The other side took too long to answer.',
      fix: 'Try again, or give the Step a longer timeout under Options.',
    }),
  },
  {
    pattern: /HTTP operation failed .*status ?code:? ?(\d{3})/i,
    explain: match => httpStatus(Number(match[1])),
  },
  {
    pattern: /Cannot store file|Cannot create directory|Access is denied|Permission denied/i,
    explain: () => ({
      meaning: "The Gateway can't write the file there.",
      fix: 'Check that the folder exists, or turn Auto Create on, and that the Gateway may write to it.',
    }),
  },
  {
    pattern: /ConnectionFactory (is null|must be specified)/i,
    explain: () => ({
      meaning: "The Step doesn't know which broker to use.",
      fix: 'Choose a Connection for the Step.',
    }),
  },
  {
    pattern: /No component found with scheme:? ?(\S+)/i,
    explain: match => ({
      meaning: `This Gateway has no ${match[1].replace(/[^\w-]/g, '')} Component.`,
      fix: 'Choose another Component, or check the spelling of the endpoint.',
    }),
  },
  {
    pattern: /Property with key \[([^\]]+)\] not found/i,
    explain: match => ({
      meaning: `The Flow refers to ${match[1]}, which has no value.`,
      fix: 'Add it under Flows → Variables, or remove the reference.',
    }),
  },
];

function httpStatus(status: number): ErrorExplanation {
  const meaning = `The server answered with HTTP status ${status}.`;
  if (status === 401 || status === 403) {
    return { meaning, fix: "It didn't accept the request's credentials: check the username, password or API key." };
  }
  if (status === 404) {
    return { meaning, fix: 'The address has no such page or resource: check the path.' };
  }
  if (status >= 500) {
    return { meaning, fix: 'Something went wrong on the server: try again later.' };
  }
  return { meaning, fix: "The server didn't accept the request: check the method, the headers and the body." };
}

/** The explanation of an error message, or null when it isn't one the Gateway knows. */
export function explainError(message: string | null | undefined): ErrorExplanation | null {
  for (const rule of RULES) {
    const match = (message ?? '').match(rule.pattern);
    if (match) {
      return rule.explain(match);
    }
  }
  return null;
}
