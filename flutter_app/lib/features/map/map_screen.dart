
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/database_service.dart';
import '../../core/types.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  List<Task> _tasks = [];
  List<Task> _filteredTasks = [];
  bool _loading = true;
  String _selectedCategory = '';
  double _maxDistance = 10.0; // 10km default
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  
  // Curridabat coordinates (approximate center)
  static const LatLng _curridabatCenter = LatLng(9.9167, -84.0333);

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _loading = true);
    try {
      final dbService = DatabaseService();
      final tasks = await dbService.fetchTasks();
      setState(() {
        _tasks = tasks;
        _filteredTasks = tasks;
        _loading = false;
      });
      _createMarkers();
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading tasks: $e')),
        );
      }
    }
  }
  
  void _createMarkers() {
    final markers = <Marker>{};
    
    for (final task in _filteredTasks) {
      if (task.latitude != null && task.longitude != null) {
        final marker = Marker(
          markerId: MarkerId(task.id),
          position: LatLng(task.latitude!, task.longitude!),
          infoWindow: InfoWindow(
            title: task.title,
            snippet: '${task.reward.toStringAsFixed(0)} CRC • ${_getCategoryLabel(task.category)}',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(_getCategoryHue(task.category.toString().split('.').last)),
        );
        markers.add(marker);
      }
    }
    
    setState(() {
      _markers = markers;
    });
  }

  void _filterTasks() {
    if (_selectedCategory.isEmpty) {
      setState(() => _filteredTasks = _tasks);
    } else {
      setState(() {
        _filteredTasks = _tasks.where((task) => 
          task.category.toString().split('.').last == _selectedCategory
        ).toList();
      });
    }
    _createMarkers();
  }

  void _handleCategoryFilter(String category) {
    setState(() {
      _selectedCategory = _selectedCategory == category ? '' : category;
    });
    _filterTasks();
  }

  void _handleDistanceFilter(double distance) {
    setState(() => _maxDistance = distance);
    // In a real app, you'd refetch tasks with the new distance filter
  }

  String _getCategoryLabel(TaskCategory category) {
    final dbService = DatabaseService();
    return dbService.getCategoryLabel(category);
  }

  double _getCategoryHue(String category) {
    final hues = {
      'cleaning': 120.0, // Green
      'gardening': 90.0, // Light green
      'petCare': 280.0, // Purple
      'deliveryErrands': 210.0, // Blue
      'movingHelp': 30.0, // Orange
      'plumbing': 210.0, // Blue
      'electrician': 30.0, // Orange
      'carpentry': 20.0, // Brown
      'painting': 280.0, // Purple
      'applianceRepair': 200.0, // Blue grey
      'laundryIroning': 180.0, // Cyan
      'cooking': 0.0, // Red
      'groceryShopping': 15.0, // Deep orange
      'trashRemoval': 200.0, // Blue grey
      'windowWashing': 180.0, // Cyan
      'babysitting': 330.0, // Pink
      'elderlyCare': 15.0, // Deep orange
      'tutoring': 210.0, // Blue
      'techSupport': 200.0, // Blue grey
      'photography': 280.0, // Purple
    };
    return hues[category] ?? 0.0; // Default to red
  }
  
  Color _getCategoryColor(String category) {
    final colors = {
      'cleaning': const Color(0xFF4CAF50),
      'gardening': const Color(0xFF8BC34A),
      'petCare': const Color(0xFF9C27B0),
      'deliveryErrands': const Color(0xFF2196F3),
      'movingHelp': const Color(0xFFFF9800),
      'plumbing': const Color(0xFF2196F3),
      'electrician': const Color(0xFFFF9800),
      'carpentry': const Color(0xFF8D6E63),
      'painting': const Color(0xFF9C27B0),
      'applianceRepair': const Color(0xFF607D8B),
      'laundryIroning': const Color(0xFF00BCD4),
      'cooking': const Color(0xFFF44336),
      'groceryShopping': const Color(0xFFFF5722),
      'trashRemoval': const Color(0xFF607D8B),
      'windowWashing': const Color(0xFF00BCD4),
      'babysitting': const Color(0xFFE91E63),
      'elderlyCare': const Color(0xFFFF5722),
      'tutoring': const Color(0xFF2196F3),
      'techSupport': const Color(0xFF607D8B),
      'photography': const Color(0xFF9C27B0),
    };
    return colors[category] ?? const Color(0xFF9E9E9E);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 60, 16, 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(
                            Icons.work,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Map View',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => context.go('/tasks'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6B7280),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'List View',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${_filteredTasks.length} tasks nearby • ${_maxDistance.toInt()}km radius',
                  style: const TextStyle(
                    color: Color(0xFF6B7280),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),

          // Category Filters
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Filter by Category',
                  style: TextStyle(
                    color: Color(0xFF374151),
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildCategoryChip('All', ''),
                      _buildCategoryChip('Cleaning', 'cleaning'),
                      _buildCategoryChip('Gardening', 'gardening'),
                      _buildCategoryChip('Pet Care', 'petCare'),
                      _buildCategoryChip('Delivery', 'deliveryErrands'),
                      _buildCategoryChip('Moving', 'movingHelp'),
                      _buildCategoryChip('Plumbing', 'plumbing'),
                      _buildCategoryChip('Electrician', 'electrician'),
                      _buildCategoryChip('Carpentry', 'carpentry'),
                      _buildCategoryChip('Painting', 'painting'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Distance Filter
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Distance Radius',
                  style: TextStyle(
                    color: Color(0xFF374151),
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [5.0, 10.0, 20.0, 50.0].map((distance) {
                    final isSelected = _maxDistance == distance;
                    return GestureDetector(
                      onTap: () => _handleDistanceFilter(distance),
                      child: Container(
                        margin: const EdgeInsets.only(right: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF10B981) : Colors.white,
                          border: Border.all(
                            color: isSelected ? const Color(0xFF10B981) : const Color(0xFFD1D5DB),
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${distance.toInt()}km',
                          style: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF374151),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

                     // Map View
           Expanded(
             child: Container(
               color: const Color(0xFFF3F4F6),
               child: _loading
                   ? const Center(
                       child: Column(
                         mainAxisAlignment: MainAxisAlignment.center,
                         children: [
                           CircularProgressIndicator(color: Color(0xFFFF6B35)),
                           SizedBox(height: 16),
                           Text(
                             'Loading map and nearby tasks...',
                             style: TextStyle(color: Color(0xFF6B7280)),
                           ),
                         ],
                       ),
                     )
                   : _filteredTasks.isEmpty
                       ? const Center(
                           child: Column(
                             mainAxisAlignment: MainAxisAlignment.center,
                             children: [
                               Icon(
                                 Icons.map_outlined,
                                 size: 64,
                                 color: Color(0xFF9CA3AF),
                               ),
                               SizedBox(height: 16),
                               Text(
                                 'No tasks found in this area',
                                 style: TextStyle(
                                   color: Color(0xFF6B7280),
                                   fontSize: 16,
                                 ),
                               ),
                            ],
                          ),
                        )
                      : Stack(
                          children: [
                            // Google Map
                            GoogleMap(
                              onMapCreated: (GoogleMapController controller) {
                                _mapController = controller;
                              },
                              initialCameraPosition: const CameraPosition(
                                target: _curridabatCenter,
                                zoom: 12.0,
                              ),
                              markers: _markers,
                              myLocationEnabled: true,
                              myLocationButtonEnabled: true,
                              zoomControlsEnabled: false,
                              mapToolbarEnabled: false,
                            ),
                            
                            // Task list overlay
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: Container(
                                height: 130,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
                                ),
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.all(16),
                                  itemCount: _filteredTasks.take(5).length,
                                  itemBuilder: (context, index) {
                                    final task = _filteredTasks[index];
                                    return Container(
                                      width: 200,
                                      margin: const EdgeInsets.only(right: 16),
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xFFE5E7EB)),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.05),
                                            blurRadius: 4,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            task.title,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 1),
                                          Text(
                                            '₡${task.reward.toInt()}',
                                            style: const TextStyle(
                                              color: Color(0xFF10B981),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                            ),
                                          ),
                                          const SizedBox(height: 1),
                                          Text(
                                            '${_getCategoryLabel(task.category)}',
                                            style: const TextStyle(
                                              color: Color(0xFF6B7280),
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, String category) {
    final isSelected = _selectedCategory == category;
    return GestureDetector(
      onTap: () => _handleCategoryFilter(category),
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? _getCategoryColor(category) : Colors.white,
          border: Border.all(
            color: isSelected ? _getCategoryColor(category) : const Color(0xFFD1D5DB),
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF374151),
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
