import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Stack,
  Button,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Link,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageCanvas from './ImageCanvas';
import { uploadToCloudinary } from '../services/cloudinary';
import { analyzeImage } from '../services/api';
import type { AnalyzeImageResponse } from '../types/azure';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';

function a11yProps(index: number) {
  return {
    id: `analyze-tab-${index}`,
    'aria-controls': `analyze-tabpanel-${index}`,
  } as const;
}

type LandingProps = {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
};

export default function Landing({ isDarkMode, onToggleTheme }: LandingProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [genderNeutral, setGenderNeutral] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeImageResponse | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setAnalysis(null);
    setSelectedBoxId(null);
    setUploadedUrl(null);
    setUploadError(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    const localUrl = URL.createObjectURL(f);
    setPreviewUrl(localUrl);

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(f);
      setUploadedUrl(url);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const canAnalyze = !!uploadedUrl && !isAnalyzing && !isUploading;

  const handleAnalyze = async () => {
    if (!uploadedUrl) return;
    try {
      // Clear previous results before new analysis
      setAnalysis(null);
      setSelectedBoxId(null);
      setTabIndex(0);
      setIsAnalyzing(true);
      const res = await analyzeImage({ url: uploadedUrl, genderNeutral });
      setAnalysis(res);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setUploadedUrl(null);
    setIsUploading(false);
    setIsAnalyzing(false);
    setAnalysis(null);
    setTabIndex(0);
    setSelectedBoxId(null);
    setFileInputKey((k) => k + 1);
  };

  const objectBoxes = useMemo(() => {
    const values = analysis?.objectsResult?.values || [];
    return values.map((v, idx) => ({
      id: `obj-${idx}`,
      ...v.boundingBox,
      label: v.tags?.[0]?.name || `object ${idx + 1}`,
      color: '#00e5ff',
    }));
  }, [analysis]);

  const denseCaptionBoxes = useMemo(() => {
    const values = analysis?.denseCaptionsResult?.values || [];
    return values.map((v, idx) => ({
      id: `dc-${idx}`,
      ...v.boundingBox,
      label: v.text,
      color: '#ffd54f',
    }));
  }, [analysis]);

  const smartCropBoxes = useMemo(() => {
    const values = analysis?.smartCropsResult?.values || [];
    return values.map((v, idx) => ({
      id: `sc-${idx}`,
      ...v.boundingBox,
      label: `crop ${v.aspectRatio}`,
      color: '#66bb6a',
    }));
  }, [analysis]);

  const allBoxes = useMemo(() => {
    if (tabIndex === 0) return objectBoxes;
    if (tabIndex === 1) return denseCaptionBoxes;
    if (tabIndex === 2) return smartCropBoxes;
    return [];
  }, [tabIndex, objectBoxes, denseCaptionBoxes, smartCropBoxes]);

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Azure Vision AI Image Analyzer
          </Typography>
          <FormControlLabel
            control={<Switch checked={isDarkMode} onChange={onToggleTheme} />}
            label={isDarkMode ? 'Dark' : 'Light'}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              Upload an image to analyze
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button variant="contained" startIcon={<UploadIcon />} component="label">
                Choose Image
                <input key={fileInputKey} hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
              {file && <Chip color="success" label={`Selected: ${file.name}`} />}
              {!file && <Chip label="No image selected yet" />}
              <FormControlLabel
                sx={{ ml: { xs: 0, sm: 2 } }}
                control={<Switch checked={genderNeutral} onChange={(e) => setGenderNeutral(e.target.checked)} />}
                label="Gender Neutral"
              />
            </Stack>

            {uploadError && <Alert severity="error">{uploadError}</Alert>}
            {isUploading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography>Uploading image…</Typography>
              </Stack>
            )}
            {uploadedUrl && <Alert severity="success">Image uploaded successfully</Alert>}

            {previewUrl && (
              <ImageCanvas
                imageUrl={previewUrl}
                boxes={selectedBoxId ? allBoxes.filter((b) => b.id === selectedBoxId) : []}
                selectedBoxId={selectedBoxId}
                onBoxClick={setSelectedBoxId}
              />
            )}

            <Divider />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              >
                Analyze Image
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isUploading || isAnalyzing}
              >
                Refresh
              </Button>
              {isAnalyzing && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography>Analyzing…</Typography>
                </Stack>
              )}
            </Stack>

            {analysis && (
              <>
                <Tabs value={tabIndex} onChange={(_, v) => { setTabIndex(v); setSelectedBoxId(null); }} aria-label="analysis tabs">
                  <Tab label={`Objects (${analysis.objectsResult?.values?.length || 0})`} {...a11yProps(0)} />
                  <Tab label={`Dense Captions (${analysis.denseCaptionsResult?.values?.length || 0})`} {...a11yProps(1)} />
                  <Tab label={`Smart Crops (${analysis.smartCropsResult?.values?.length || 0})`} {...a11yProps(2)} />
                  <Tab label={`Tags (${analysis.tagsResult?.values?.length || 0})`} {...a11yProps(3)} />
                </Tabs>

                {tabIndex === 0 && (
                  <Stack spacing={1}>
                    {(analysis.objectsResult?.values || []).map((o, i) => {
                      const name = o.tags?.[0]?.name || 'object';
                      const conf = o.tags?.[0]?.confidence;
                      const label =
                        conf != null
                          ? `${name} (${conf.toFixed(2)})`
                          : name;
                      return (
                        <Chip
                          key={i}
                          label={label}
                          variant="outlined"
                          onClick={() => setSelectedBoxId(`obj-${i}`)}
                        />
                      );
                    })}
                  </Stack>
                )}

                {tabIndex === 1 && (
                  <Stack spacing={1}>
                    {(analysis.denseCaptionsResult?.values || []).map((o, i) => (
                      <Chip
                        key={i}
                        label={`${o.text} (${o.confidence.toFixed(2)})`}
                        variant="outlined"
                        onClick={() => setSelectedBoxId(`dc-${i}`)}
                      />
                    ))}
                  </Stack>
                )}

                {tabIndex === 2 && (
                  <Stack spacing={1}>
                    {(analysis.smartCropsResult?.values || []).map((o, i) => (
                      <Chip key={i} label={`Aspect: ${o.aspectRatio}`} variant="outlined" onClick={() => setSelectedBoxId(`sc-${i}`)} />
                    ))}
                  </Stack>
                )}

                {tabIndex === 3 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(analysis.tagsResult?.values || []).map((t, i) => (
                      <Chip key={i} label={`${t.name} (${t.confidence.toFixed(2)})`} />
                    ))}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Paper>
        <Stack sx={{ pt: 4, pb: 2 }} alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary" align="center">
            Get to know me and this project:
            {' '}
            <Link
              href={process.env.REACT_APP_REPO_URL?.replace(/^@/, '') || 'https://github.com/Moustafaa91/azure_ai_vision_frontend'}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mr: 1 }}
            >
              <GitHubIcon fontSize="small" />
              Frontend Repo
            </Link>
            ·
            {' '}
            <Link
              href={process.env.REACT_APP_BE_REPO_URL?.replace(/^@/, '') || 'https://github.com/Moustafaa91/azure_ai_vision_be'}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 1 }}
            >
              <GitHubIcon fontSize="small" />
              Backend Repo
            </Link>
          </Typography>
        </Stack>
      </Container>
    </>
  );
}


