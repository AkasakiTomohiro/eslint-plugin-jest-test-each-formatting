import { Rule, SourceCode } from 'eslint';

type Node = Parameters<Exclude<Rule.NodeListener['TaggedTemplateExpression'], undefined>>[0];

const matchList = [
  'describe.each',
  'describe.only.each',
  'describe.skip.each',
  'test.concurrent.each',
  'test.concurrent.failing.each',
  'test.concurrent.only.each',
  'test.concurrent.skip.each',
  'test.each',
  'test.failing.each',
  'test.only.each',
  'test.skip.each',
  'it.concurrent.each',
  'it.concurrent.failing.each',
  'it.concurrent.only.each',
  'it.concurrent.skip.each',
  'it.each',
  'it.failing.each',
  'it.only.each',
  'it.skip.each'
] as const;
type MatchString = typeof matchList[number];

type Result = {
  range: Exclude<Node['range'], undefined>
  loc: Exclude<Node['loc'], undefined | null>
  source: string
  header: string[]
  splitCharCount: number
  matchString: MatchString
}

/**
 * jest eachの変数を取得する
 * @param node 
 */
export function getTestEachVariables(node: Node, sourceCode: SourceCode): Result | undefined {

  // rangeとlocがなければ終了;
  const { range, loc } = node;
  if(range === undefined || loc === null || loc === undefined) {
    return;
  }

  // test.eachでなければ終了
  const source = sourceCode.getText(node);

  const match = (matchList.map(m => source.match(new RegExp(`^${m.replace('.', '\.')}.*`))).filter(f => f !== null) as RegExpMatchArray[]);
  if(match.length === 0 || match[0].length === 0) {
    return;
  }
  const matchString = match[0][0].split('`')[0] as MatchString;

  // テンプレート文字列を取得
  const [headerArray, ...templateString] = node.quasi.quasis
    .map(m => m.value.raw.replace(/ /g, '').replace(/\r/g, '').replace(/\n/g, ''))
    .filter(f => f !== '');
  const header = headerArray.split('|');

  return {
    range, 
    loc, 
    source, 
    header,
    matchString,
    splitCharCount: templateString.length
  };
}

