import React, { memo, useMemo, useRef, useEffect, useState } from 'react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import supersub from 'remark-supersub';
import rehypeKatex from 'rehype-katex';
import { useRecoilValue } from 'recoil';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkDirective from 'remark-directive';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import type { Pluggable } from 'unified';
import {
  useToastContext,
  ArtifactProvider,
  CodeBlockProvider,
  useCodeBlockContext,
} from '~/Providers';
import { Artifact, artifactPlugin } from '~/components/Artifacts/Artifact';
import { langSubset, preprocessLaTeX, handleDoubleClick } from '~/utils';
import CodeBlock from '~/components/Messages/Content/CodeBlock';
import useHasAccess from '~/hooks/Roles/useHasAccess';
import { useFileDownload } from '~/data-provider';
import useLocalize from '~/hooks/useLocalize';
import store from '~/store';

type TCodeProps = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const code: React.ElementType = memo(({ className, children }: TCodeProps) => {
  const canRunCode = useHasAccess({
    permissionType: PermissionTypes.RUN_CODE,
    permission: Permissions.USE,
  });
  const match = /language-(\w+)/.exec(className ?? '');
  const lang = match && match[1];
  const isMath = lang === 'math';
  const isSingleLine = typeof children === 'string' && children.split('\n').length === 1;

  const { getNextIndex, resetCounter } = useCodeBlockContext();
  const blockIndex = useRef(getNextIndex(isMath || isSingleLine)).current;

  useEffect(() => {
    resetCounter();
  }, [children, resetCounter]);

  if (isMath) {
    return <>{children}</>;
  } else if (isSingleLine) {
    return (
      <code onDoubleClick={handleDoubleClick} className={className}>
        {children}
      </code>
    );
  } else {
    return (
      <CodeBlock
        lang={lang ?? 'text'}
        codeChildren={children}
        blockIndex={blockIndex}
        allowExecution={canRunCode}
      />
    );
  }
});

export const codeNoExecution: React.ElementType = memo(({ className, children }: TCodeProps) => {
  const match = /language-(\w+)/.exec(className ?? '');
  const lang = match && match[1];

  if (lang === 'math') {
    return children;
  } else if (typeof children === 'string' && children.split('\n').length === 1) {
    return (
      <code onDoubleClick={handleDoubleClick} className={className}>
        {children}
      </code>
    );
  } else {
    return <CodeBlock lang={lang ?? 'text'} codeChildren={children} allowExecution={false} />;
  }
});

type TAnchorProps = {
  href: string;
  children: React.ReactNode;
};

export const a: React.ElementType = memo(({ href, children }: TAnchorProps) => {
  const user = useRecoilValue(store.user);
  const { showToast } = useToastContext();
  const localize = useLocalize();

  const {
    file_id = '',
    filename = '',
    filepath,
  } = useMemo(() => {
    const pattern = new RegExp(`(?:files|outputs)/${user?.id}/([^\\s]+)`);
    const match = href.match(pattern);
    if (match && match[0]) {
      const path = match[0];
      const parts = path.split('/');
      const name = parts.pop();
      const file_id = parts.pop();
      return { file_id, filename: name, filepath: path };
    }
    return { file_id: '', filename: '', filepath: '' };
  }, [user?.id, href]);

  const { refetch: downloadFile } = useFileDownload(user?.id ?? '', file_id);
  const props: { target?: string; onClick?: React.MouseEventHandler } = { target: '_new' };

  if (!file_id || !filename) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  const handleDownload = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      const stream = await downloadFile();
      if (stream.data == null || stream.data === '') {
        console.error('Error downloading file: No data found');
        showToast({
          status: 'error',
          message: localize('com_ui_download_error'),
        });
        return;
      }
      const link = document.createElement('a');
      link.href = stream.data;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(stream.data);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  props.onClick = handleDownload;
  props.target = '_blank';

  return (
    <a
      href={filepath.startsWith('files/') ? `/api/${filepath}` : `/api/files/${filepath}`}
      {...props}
    >
      {children}
    </a>
  );
});

type TParagraphProps = {
  children: React.ReactNode;
};

export const p: React.ElementType = memo(({ children }: TParagraphProps) => {
  return <p className="mb-2 whitespace-pre-wrap">{children}</p>;
});

type TContentProps = {
  content: string;
  isLatestMessage: boolean;
};

const Markdown = memo(({ content = '', isLatestMessage }: TContentProps) => {
  const LaTeXParsing = useRecoilValue<boolean>(store.LaTeXParsing);
  const isInitializing = content === '';
  const [currentPage, setCurrentPage] = useState<any>(null);

  const currentContent = useMemo(() => {
    if (isInitializing) {
      return '';
    }
    return LaTeXParsing ? preprocessLaTeX(content) : content;
  }, [content, LaTeXParsing, isInitializing]);

  const rehypePlugins = useMemo(
    () => [
      [rehypeKatex, { output: 'mathml' }],
      [
        rehypeHighlight,
        {
          detect: true,
          ignoreMissing: true,
          subset: langSubset,
        },
      ],
    ],
    [],
  );

  const remarkPlugins: Pluggable[] = useMemo(
    () => [
      supersub,
      remarkGfm,
      remarkDirective,
      artifactPlugin,
      [remarkMath, { singleDollarTextMath: true }],
    ],
    [],
  );

  if (isInitializing) {
    return (
      <div className="absolute">
        <p className="relative">
          <span className={isLatestMessage ? 'result-thinking' : ''} />
        </p>
      </div>
    );
  }

  console.log(currentContent, 'Markdown content');
  // 截取从data_start开始且以data_end结尾的内容
  const startIndex = currentContent.indexOf('data_start') + 'data_start'.length;
  const endIndex = currentContent.indexOf('data_end');
  // 判断是否存在data_start和data_end

  const hasDataStart = startIndex > -1;
  const hasDataEnd = endIndex > -1;
  console.log(startIndex, endIndex, 'startIndex', 'endIndex');

  console.log(hasDataStart, hasDataEnd, 'hasDataStart', 'hasDataEnd');

  if (!hasDataStart || !hasDataEnd) {
    return (
      <ArtifactProvider>
        <CodeBlockProvider>
          <ReactMarkdown
            /** @ts-ignore */
            remarkPlugins={remarkPlugins}
            /* @ts-ignore */
            rehypePlugins={rehypePlugins}
            components={
              {
                code,
                a,
                p,
                artifact: Artifact,
              } as {
                [nodeType: string]: React.ElementType;
              }
            }
          >
            {currentContent}
          </ReactMarkdown>
        </CodeBlockProvider>
      </ArtifactProvider>
    );
  }

  const validContent = currentContent.substring(startIndex, endIndex).trim();
  const dataArr = JSON.parse(validContent);
  console.log(dataArr, 'dataArr');
  // 获取 data_start之前的内容
  const contentBeforeDataStart = currentContent.substring(0, startIndex - 'data_start'.length);

  const handleClickPage = (item: any) => {
    setCurrentPage((prev) => {
      if (prev) {
        return null;
      } else {
        return { ...item };
      }
    });
  };

  return (
    <ArtifactProvider>
      <CodeBlockProvider>
        <ReactMarkdown
          /** @ts-ignore */
          remarkPlugins={remarkPlugins}
          /* @ts-ignore */
          rehypePlugins={rehypePlugins}
          components={
            {
              code,
              a,
              p,
              artifact: Artifact,
            } as {
              [nodeType: string]: React.ElementType;
            }
          }
        >
          {contentBeforeDataStart}
        </ReactMarkdown>
        <div>
          {dataArr.map((item) => {
            return (
              <span key={item.pageNumber} className="">
                {item.documentChunk}
                <span
                  className="mx-1 inline-flex h-5 w-5 cursor-pointer items-center justify-center text-xs text-gray-500 transition-all duration-300 hover:bg-gray-100 hover:text-blue-500"
                  onClick={() => handleClickPage(item)}
                >
                  [{item.pageNumber}]
                </span>
              </span>
            );
          })}
        </div>
        <br />
        {/* 5列 */}
        <div className="grid grid-cols-5 gap-4">
          {dataArr.map((item, index) => {
            return (
              <div
                className={
                  'flex cursor-pointer items-center justify-center rounded border py-2 transition-all duration-300 hover:bg-gray-100 hover:text-blue-500'
                }
                key={item.pageNumber}
                onClick={() => handleClickPage(item)}
                // eslint-disable-next-line i18next/no-literal-string
              >
                Source{item.pageNumber}
              </div>
            );
          })}
        </div>
        {currentPage && (
          <div>
            <p>{currentPage.documentPath}</p>
            <div>{currentPage.documentChunk}</div>
          </div>
        )}
      </CodeBlockProvider>
    </ArtifactProvider>
  );
});

export default Markdown;
