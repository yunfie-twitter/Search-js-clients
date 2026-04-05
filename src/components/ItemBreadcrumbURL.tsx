import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';

interface ItemBreadcrumbURLProps {
  url: string;
  favicon?: string;
}

const getSiteName = (urlStr: string): { name: string; domain: string } => {
  try {
    const u    = new URL(urlStr);
    const host = u.hostname.replace(/^www\./, '');
    // ブランド名推定: サブドメインなしの最初のセグメント
    const parts = host.split('.');
    const brand = parts.length >= 2
      ? parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1)
      : host;
    return { name: brand, domain: host };
  } catch {
    return { name: urlStr, domain: urlStr };
  }
};

const ItemBreadcrumbURL: React.FC<ItemBreadcrumbURLProps> = ({ url, favicon }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const faviconUrl = favicon ||
    `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url || 'http://localhost').hostname}`;
  const { name, domain } = getSiteName(url);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '4px' }}>
      {/* favicon */}
      <Box
        component="img"
        src={faviconUrl}
        alt=""
        onError={(e: any) => { e.target.style.display = 'none'; }}
        sx={{ width: 14, height: 14, borderRadius: '3px', flexShrink: 0, objectFit: 'contain' }}
      />
      {/* ブランド名 */}
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 600,
          color: isDark ? '#f2f2f7' : '#1c1c1e',
          lineHeight: 1,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
      {/* セパレーター */}
      <Typography sx={{ fontSize: '11px', color: isDark ? '#48484a' : '#c7c7cc', lineHeight: 1 }}>
        ·
      </Typography>
      {/* ドメイン */}
      <Typography
        sx={{
          fontSize: '11px',
          color: isDark ? '#636366' : '#8e8e93',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '220px',
          letterSpacing: '0em',
        }}
      >
        {domain}
      </Typography>
    </Box>
  );
};

export default memo(ItemBreadcrumbURL);
