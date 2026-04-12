import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, IconButton, Button,
  CircularProgress, Paper, Divider,
  Link as MuiLink,
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackIcon,
  OpenInNewOutlined as OpenInNewIcon,
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerHaptic } from '../utils/haptics';
import { BottomNavSpacer } from '../components/MobileBottomNav';

/**
 * 高性能 Markdown レンダラー (MUI版)
 * ライブラリなしでリンク、見出し、装飾を美しく描画します。
 */
const MarkdownContent: React.FC<{ content: string }> = memo(({ content }) => {

  const lines = useMemo(() => content.split('\n'), [content]);

  const renderLine = (line: string, index: number) => {
    // 空行
    if (!line.trim()) return <Box key={index} sx={{ height: '1em' }} />;

    // 見出し
    if (line.startsWith('# ')) {
      return <Typography key={index} variant="h4" sx={{ fontWeight: 800, mt: 4, mb: 2 }}>{line.slice(2)}</Typography>;
    }
    if (line.startsWith('## ')) {
      return <Typography key={index} variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1.5 }}>{line.slice(3)}</Typography>;
    }
    if (line.startsWith('### ')) {
      return <Typography key={index} variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>{line.slice(4)}</Typography>;
    }

    // 引用
    if (line.startsWith('> ')) {
      return (
        <Box key={index} sx={{ borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, py: 0.5, my: 2, bgcolor: 'action.hover', borderRadius: '0 8px 82x 0' }}>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{parseInline(line.slice(2))}</Typography>
        </Box>
      );
    }

    // リスト
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <Box key={index} sx={{ display: 'flex', gap: 1.5, pl: 1, mb: 1 }}>
          <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', mt: 1.2, flexShrink: 0 }} />
          <Typography variant="body1">{parseInline(line.slice(2))}</Typography>
        </Box>
      );
    }

    // 標準の段落
    return <Typography key={index} variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: { xs: '17px', md: '18px' } }}>{parseInline(line)}</Typography>;
  };

  /**
   * インライン要素（リンク、太字、コード）の解析
   */
  const parseInline = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];

    // 1. リンク [text](url)
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const result = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        result.push(part.substring(lastIndex, match.index));
        result.push(<MuiLink key={match.index} href={match[2]} target="_blank" rel="noopener" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{match[1]}</MuiLink>);
        lastIndex = regex.lastIndex;
      }
      result.push(part.substring(lastIndex));
      return result;
    });

    // 2. 太字 **text**
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const regex = /\*\*([^*]+)\*\*/g;
      const result = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        result.push(part.substring(lastIndex, match.index));
        result.push(<Box component="span" key={match.index} sx={{ fontWeight: 800, color: 'text.primary' }}>{match[1]}</Box>);
        lastIndex = regex.lastIndex;
      }
      result.push(part.substring(lastIndex));
      return result;
    });

    // 3. インラインコード `code`
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const regex = /`([^`]+)`/g;
      const result = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        result.push(part.substring(lastIndex, match.index));
        result.push(<Box component="code" key={match.index} sx={{ bgcolor: 'action.hover', px: 0.6, py: 0.2, borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' }}>{match[1]}</Box>);
        lastIndex = regex.lastIndex;
      }
      result.push(part.substring(lastIndex));
      return result;
    });

    return parts;
  };

  return <Box sx={{ color: 'text.primary' }}>{lines.map((l, i) => renderLine(l, i))}</Box>;
});

const MarkdownViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const url = searchParams.get('url');
  const { markdownApiEndpoint, markdownApiMethod, language } = useSearchStore(useShallow(s => ({ markdownApiEndpoint: s.markdownApiEndpoint, markdownApiMethod: s.markdownApiMethod, language: s.language })));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<{ 
    title: string, 
    markdown: string,
    author?: string,
    image?: string,
    url?: string 
  } | null>(null);

  const parseMarkdownData = useCallback((data: { title: string, markdown: string }) => {
    const md = data.markdown;
    const meta: any = { title: data.title, markdown: md };

    // フロントマターの解析 (--- で囲まれた部分)
    const fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (fmMatch) {
      const frontmatter = fmMatch[1];
      const lines = frontmatter.split('\n');
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim();
          const val = line.slice(colonIndex + 1).trim();
          if (key && val) meta[key] = val;
        }
      });
      // メタデータを除去した純粋な本文
      meta.markdown = md.replace(fmMatch[0], '').trim();
    }

    return meta;
  }, []);

  const fetchMarkdown = useCallback(async (signal: AbortSignal) => {
    if (!url) {
      setError('URL is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let response;
      if (markdownApiMethod === 'GET') {
        const target = new URL(markdownApiEndpoint.replace('/convert', '/markdown'));
        target.searchParams.set('url', url);
        response = await fetch(target.toString(), { signal });
      } else {
        response = await fetch(markdownApiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal,
        });
      }

      if (!response.ok) throw new Error('Conversion failed');
      const data = await response.json();
      setContent(parseMarkdownData(data));
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setError(language === 'ja' ? 'Markdownへの変換に失敗しました' : 'Failed to convert to Markdown');
    } finally {
      setLoading(false);
    }
  }, [url, markdownApiEndpoint, markdownApiMethod, language, parseMarkdownData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMarkdown(controller.signal);
    return () => controller.abort();
  }, [fetchMarkdown]);

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  return (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%',
      overflow: 'hidden', bgcolor: 'background.default' 
    }}>
      {/* Header */}
      <Box sx={{
        p: 2, pt: 'calc(env(safe-area-inset-top) + 12px)',
        display: 'flex', alignItems: 'center', backgroundColor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider', zIndex: 10,
      }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{content?.title || (loading ? 'Loading...' : 'Error')}</Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary', opacity: 0.8 }}>{content?.author || url}</Typography>
        </Box>
        <IconButton component="a" href={url || '#'} target="_blank" sx={{ ml: 1 }}><OpenInNewIcon fontSize="small" /></IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', bgcolor: 'background.paper' }}>
        {content?.image && (
          <Box sx={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
            <Box component="img" src={content.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}

        <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
              <CircularProgress size={32} thickness={4} />
              <Typography variant="body2" color="text.secondary">Converting...</Typography>
            </Box>
          ) : error ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="outlined" onClick={() => fetchMarkdown(new AbortController().signal)}>Retry</Button>
            </Paper>
          ) : content && (
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2, fontSize: { xs: '28px', md: '40px' } }}>{content.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                  {content.author?.charAt(0) || 'W'}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700}>{content.author || 'Unknown Author'}</Typography>
                  <Typography variant="caption" color="text.secondary">{content.url || url}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 5 }} />
              <MarkdownContent content={content.markdown} />
            </Box>
          )}
          <Box sx={{ height: 100 }} />
        </Container>
        <BottomNavSpacer />
      </Box>
    </Box>
  );
};

export default MarkdownViewer;
