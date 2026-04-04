import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  IconButton,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackIcon,
  ScienceOutlined as ScienceIcon,
  ImageSearchOutlined as ImageSearchIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SwitchItem from '../components/settings/SwitchItem';

const Labs: React.FC = () => {
  const navigate = useNavigate();
  const language      = useSearchStore((s) => s.language);
  const expImageSearch = useSearchStore((s) => s.expImageSearch);
  const setExpImageSearch = useSearchStore((s) => s.setExpImageSearch);
  const t = React.useMemo(() => translations[language], [language]);

  const [expAiSummary, setExpAiSummary] = useState(false);
  const [expInstantResults, setExpInstantResults] = useState(false);
  const [expKnowledgePanel, setExpKnowledgePanel] = useState(false);

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        pt: 'calc(env(safe-area-inset-top) + 16px)',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon sx={{ color: 'warning.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t.sectionExperimental}
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ py: 2, pb: 8, flexGrow: 1 }}>

        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 2, borderRadius: '12px', fontSize: '13px' }}
        >
          {t.experimentalNote}
        </Alert>

        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalAiSummary}
              secondary={t.experimentalAiSummaryDesc}
              checked={expAiSummary}
              onChange={setExpAiSummary}
              chip="β"
              disabled
            />
            <Divider />
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalInstantResults}
              secondary={t.experimentalInstantResultsDesc}
              checked={expInstantResults}
              onChange={setExpInstantResults}
              chip="β"
              disabled
            />
            <Divider />
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalKnowledgePanel}
              secondary={t.experimentalKnowledgePanelDesc}
              checked={expKnowledgePanel}
              onChange={setExpKnowledgePanel}
              chip="β"
              disabled
            />
            <Divider />
            <SwitchItem
              icon={<ImageSearchIcon />}
              primary={t.experimentalImageSearch}
              secondary={t.experimentalImageSearchDesc}
              checked={expImageSearch}
              onChange={setExpImageSearch}
              chip="β"
            />
          </List>
        </Paper>

      </Container>
    </Box>
  );
};

export default Labs;
