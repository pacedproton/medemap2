# MeDeMAP - Mapping Media for Future Democracies

MeDeMAP is a web application that visualizes and analyzes media data across European countries. It aims to clarify the extent to which certain media perform democratic functions for various audiences under different conditions.

## Features

- **Interactive 3D globe visualization using Cesium**
- **2D data views** including tables, charts, and histograms
- **Data selection interface** for customized visualizations
- **Multi-language support**
- **Responsive design** for various screen sizes

## Technologies Used

- **Next.js**
- **React**
- **Redux Toolkit**
- **TypeScript**
- **Material-UI**
- **AG-Grid**
- **Cesium**
- **PostgreSQL**

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**
- **PostgreSQL** database

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/medemap.git
    ```

2. **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Run DB migrations**:
    ```bash
    knex migrate:latest
    ```

4. **Configure the application**:
    - Edit the `config.yaml` file to set your Cesium Ion access token and other configurations. 

5. **Run the development server or deploy to Kubernetes**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

6. **Open** `http://localhost:3000` in your browser.

## Project Structure

- **`app/`**: Next.js app directory containing pages and components
- **`lib/`**: Redux store, slices, and utility functions
- **`public/`**: Static assets
- **`styles/`**: Global and component-specific styles

## Key Components

### Main Selections

The `Main Selections` component allows users to choose data columns for visualization:

```typescript
const MainSelections = () => {
  const dispatch = useDispatch();
  const medeMapState = useSelector(selectMedeMapData);
  const loading = useSelector(selectMedeMapLoading);
  const error = useSelector(selectMedeMapError);
  const [localSelectedOptions, setLocalSelectedOptions] = useState<{ [key: string]: any[] }>({});
  const [feedback, setFeedback] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);

  const steps = [
    { target: '.data-selection-title', content: 'Welcome to the Data Selection page. Here you can choose data columns for visualization.', disableBeacon: true },
    { target: '.select-box', content: 'Use these dropdown menus to select columns from different tables.' },
    { target: '.submit-button', content: 'After selecting your data, click this button to submit your choices.' },
    { target: '.selected-options', content: 'Your selected options will appear here after submission.' },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRunTutorial(false);
    }
  };

  useEffect(() => {
    if (!medeMapState.data || Object.keys(medeMapState.data).length === 0) {
      console.log('Fetching MedeMap data...');
      setShowProgress(true);
      dispatch(fetchMedeMapData());

      setTimeout(() => {
        setShowProgress(false);
      }, 2000);
    } else {
      console.log('MedeMap data already loaded:', medeMapState);
    }

    const savedSelections = localStorage.getItem('selectedOptions');
    if (savedSelections) {
      const parsedSelections = JSON.parse(savedSelections);
      setLocalSelectedOptions(parsedSelections);
      dispatch(setSelectedOptions(parsedSelections));
    }
  }, [dispatch, medeMapState.data]);

  useEffect(() => {
    console.log('MedeMap state updated:', medeMapState);
  }, [medeMapState]);

  const handleOptionChange = (tableName: string, selectedOptions: any) => {
    const updatedSelections = { ...localSelectedOptions, [tableName]: selectedOptions };
    setLocalSelectedOptions(updatedSelections);

    localStorage.setItem('selectedOptions', JSON.stringify(updatedSelections));
  };

  const handleSubmit = () => {
    dispatch(setSelectedOptions(localSelectedOptions));
    const selectedCount = Object.values(localSelectedOptions).flat().length;
    setFeedback(`Selected ${selectedCount} indicators for processing.`);

    localStorage.setItem('selectedOptions', JSON.stringify(localSelectedOptions));
  };
};