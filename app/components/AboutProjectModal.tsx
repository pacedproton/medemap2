'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import styles from './AboutProjectModal.module.css';
import Image from 'next/image';

interface AboutProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutProjectModal: React.FC<AboutProjectModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="about-project-dialog-title"
      maxWidth={false}
      fullWidth
      className={`${styles.styledDialog} ${styles.wideDialog}`}
    >
      <DialogTitle id="about-project-dialog-title" className={styles.styledDialogTitle}>
        Map of EU Political Information Environments

      </DialogTitle>
      <DialogContent dividers className={styles.dialogContent}>
        <Typography variant="h4">About the Project</Typography>
        <Box className={styles.vspace20}>
          <Typography variant="body1">
            This project aims to map the political information environments across the European Union, providing insights into media landscapes and their impact on democracy.
          </Typography>
        </Box>
        <Card className={styles.vspace20}>
          
          <CardContent>
            <Typography variant="body1">
              This is a pilot version of the Map of EU Political Information Environments that will be continuously improved, expanded and upgraded during the course of the project.
            </Typography>
          </CardContent>
        </Card>
        <Typography variant="body1" gutterBottom className={styles.vspace20}>
          The Map of EU Political Information Environments is a web-tool that provides rich information on media landscapes in EU Member States. The map is part of the Horizon Europe research project „Mapping Media for Future Democracies" (MeDeMAP). The project is carried out in collaboration of ten European institutions to set out future-proof pathways to strengthen democracy through improving accountability, transparency, and effectiveness of media production, and expanding active and inclusive citizenship.
          
        </Typography>
        <Typography variant="body1" gutterBottom>
          MeDeMAP aims to clarify the extent to which certain media under which conditions perform which democratic functions for which audiences, thus making it apparent what is at stake for democratic media – and for democracy itself.
        </Typography>
        <Box className={styles.vspace20}>
          <Typography variant="h5">Project Methodology</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          By applying an innovative multi-method design consisting of data science methods, large-scale quantitative analyses, in-depth qualitative approaches, and participatory action research, the project will cover:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Perspectives of both representative and participatory notions of democracy as they exist in European societies" />
          </ListItem>
          <ListItem>
            <ListItemText primary="The entire range of news media, regardless of distribution channel, mandate, ownership, and source of financing" />
          </ListItem>
          <ListItem>
            <ListItemText primary="The legal and (self-)regulatory framework under which media houses and journalism operate and people use media" />
          </ListItem>
          <ListItem>
            <ListItemText primary="The media's potential to promote and support political participation (supply side)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="The media use patterns, communication needs, and democratic attitudes of the audiences (demand side) in EU Member States" />
          </ListItem>
        </List>
        <Box className={styles.vspace20}>
        <Typography variant="h5">Interactive Map</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          Based on the research findings, an interactive map of European political information environments has been created, with layers reflecting the national legal and regulatory frameworks and the democratically relevant features of media supply and demand. The underlying dataset comprises selected quantitative data from European and international databases and studies covering all EU Member States, and – in a later phase of the project – data from in-depth research on political information environments of the ten countries of the MeDeMAP Consortium: Austria, Czech Republic, Estonia, France, Germany, Ireland, Italy, Poland, Portugal and Slovenia (please read the Data Annotations).
        </Typography>
        <Typography variant="body1" gutterBottom>
          By comparing data from different indicators on the different layers across countries, conclusions can be drawn from congruencies and discrepancies between them, good practice examples can be identified, and guidelines can be derived to support developments that promote democracy and counteract phenomena that could jeopardize democracy.
        </Typography>
        <Card className={styles.vspace20}>
          <CardContent className={styles.teamCard}>
            <Typography variant="h5" className={styles.teamTitle}>Project Team</Typography>
            <Box className={styles.teamSection}>
              <Typography variant="subtitle1" gutterBottom>Publisher of the map:</Typography>
              <Typography variant="body2">Institute for Comparative Media and Communication Studies (CMC), Austrian Academy of Sciences (OEAW) and University of Klagenfurt</Typography>
            </Box>
            <Box className={styles.teamSection}>
              <Typography variant="subtitle1" gutterBottom>MeDeMAP Research Group OEAW:</Typography>
              <Typography variant="body2">
                Maren Beaufort<br />
                Josef Seethaler (Coordinator)<br />
                Ernest Thaqi<br />
                Barbara Thomaß
              </Typography>
            </Box>
            <Box className={styles.teamSection}>
              <Typography variant="subtitle1" gutterBottom>With contributions by:</Typography>
              <Typography variant="body2">
                Beata Klimkiewicz, Jagiellonian University in Kraków (supply side)<br />
                Panos Kompatsiaris, IULM University, Milan (demand side)
              </Typography>
            </Box>
            <Box className={styles.teamSection}>
              <Typography variant="subtitle1" gutterBottom>Technical implementation and design:</Typography>
              <Typography variant="body2">
                Institute for Comparative Media and Communication Studies (CMC), Austrian Academy of Sciences (OEAW) and University of Klagenfurt<br />
                MA
              </Typography>
            </Box>
            <Box className={styles.teamSection}>
              <Typography variant="subtitle1" gutterBottom>Contact:</Typography>
              <Typography variant="body2">josef.seethaler@oeaw.ac.at</Typography>
            </Box>
          </CardContent>
        </Card>

        <Box className={styles.vspace20}>
        </Box>
        <Box display="flex" justifyContent="center">
          <Image src="/images/MeDeMAPlogo_color.jpg" alt="MeDeMA Logo" width={300} height={100} />
        </Box>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AboutProjectModal;